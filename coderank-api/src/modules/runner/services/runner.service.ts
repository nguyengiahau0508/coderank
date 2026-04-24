// coderunner/runner.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ProgrammingLanguageEnum } from 'src/common/enums/enums';
import { RunCodeDto } from '../dto/run-code.dto';
import { RunResultDto, RunStatusEnum } from '../dto/run-result.dto';

@Injectable()
export class RunnerService {
  private readonly logger = new Logger(RunnerService.name);
  private readonly WORKDIR = path.join(os.tmpdir(), 'coderank');
  private readonly DOCKER_BIN = process.env.CODERANK_DOCKER_BIN || 'docker';
  private readonly PYTHON_IMAGE =
    process.env.CODERANK_RUNNER_PYTHON_IMAGE || 'python:3.12-alpine';
  private readonly CPP_IMAGE =
    process.env.CODERANK_RUNNER_CPP_IMAGE || 'gcc:14';
  private readonly COMPILE_TIMEOUT_MS =
    Number(process.env.CODERANK_RUNNER_COMPILE_TIMEOUT_MS) || 15000;
  private readonly IMAGE_PULL_TIMEOUT_MS =
    Number(process.env.CODERANK_RUNNER_IMAGE_PULL_TIMEOUT_MS) || 180000;
  private readonly readyImages = new Set<string>();
  private readonly imagePreparationTasks = new Map<string, Promise<void>>();

  async runCode(dto: RunCodeDto) {
    const id = randomUUID();
    const dir = path.join(this.WORKDIR, id);
    await fs.mkdir(dir, { recursive: true });
    const start = Date.now();

    const timeLimit = dto.timeLimit ?? 2000;
    const memoryLimit = dto.memoryLimit ?? 256; // MB

    let execCmd: string;
    let fallbackExecCmd: string | null = null;
    let compileCmd: string | null = null;
    let runtimeImage: string;

    // -------- Handle language ----------
    switch (dto.language) {
      case ProgrammingLanguageEnum.Python: {
        const file = path.join(dir, 'main.py');
        await fs.writeFile(file, dto.code);
        execCmd = `python3 main.py`;
        runtimeImage = this.PYTHON_IMAGE;
        break;
      }

      case ProgrammingLanguageEnum.CPlusPlus: {
        const file = path.join(dir, 'main.cpp');
        //const bin = path.join(dir, 'main.out');
        await fs.writeFile(file, dto.code);
        compileCmd = `g++ main.cpp -O2 -std=c++17 -o main.out`;
        execCmd = `./main.out`;
        // Some Docker Desktop + Windows bind-mount setups can lose executables
        // between separate containers; keep a single-container fallback.
        fallbackExecCmd = `${compileCmd} && ${execCmd}`;
        runtimeImage = this.CPP_IMAGE;
        break;
      }

      default: {
        throw new Error(`Unsupported language: ${dto.language}`);
      }
    }

    try {
      await this.ensureImageReady(runtimeImage);

      // -------- Compile ----------
      if (compileCmd) {
        const compileTimeLimit = Math.max(timeLimit, this.COMPILE_TIMEOUT_MS);
        const compileRes = await this.execSandbox(
          compileCmd,
          runtimeImage,
          dir,
          '',
          compileTimeLimit,
          memoryLimit,
        );

        if (compileRes.status !== RunStatusEnum.OK) {
          if (
            compileRes.status === RunStatusEnum.TLE ||
            compileRes.status === RunStatusEnum.MLE
          ) {
            return compileRes;
          }

          return { ...compileRes, status: RunStatusEnum.CE };
        }
      }

      // -------- Run ----------
      const runRes = await this.execSandbox(
        execCmd,
        runtimeImage,
        dir,
        dto.input ?? '',
        timeLimit,
        memoryLimit,
      );

      const missingExecutableOnRun =
        runRes.status === RunStatusEnum.RE &&
        /\.\/main\.out:\s+not\s+found/i.test(runRes.stderr ?? '');

      if (fallbackExecCmd && missingExecutableOnRun) {
        this.logger.warn(
          'Detected missing main.out after compile; retrying C++ run in a single container.',
        );

        return this.execSandbox(
          fallbackExecCmd,
          runtimeImage,
          dir,
          dto.input ?? '',
          timeLimit,
          memoryLimit,
        );
      }

      return runRes;
    } catch (error: any) {
      const details = String(error?.message ?? error ?? 'Unknown runner error');
      this.logger.error(`runCode failed: ${details}`);
      return {
        status: RunStatusEnum.RE,
        stdout: '',
        stderr: details,
        time: Date.now() - start,
        memory: 0,
      };
    } finally {
      await fs.rm(dir, { recursive: true, force: true }).catch((error) => {
        this.logger.warn(`failed to cleanup workdir ${dir}: ${String(error)}`);
      });
    }
  }

  private async ensureImageReady(image: string): Promise<void> {
    if (this.readyImages.has(image)) {
      return;
    }

    const inFlight = this.imagePreparationTasks.get(image);
    if (inFlight) {
      return inFlight;
    }

    const task = this.prepareImage(image).finally(() => {
      this.imagePreparationTasks.delete(image);
    });

    this.imagePreparationTasks.set(image, task);
    return task;
  }

  private async prepareImage(image: string): Promise<void> {
    const inspect = await this.runDockerCommand(
      ['image', 'inspect', image],
      15000,
    );

    if (inspect.code === 0) {
      this.readyImages.add(image);
      return;
    }

    this.logger.log(
      `Docker image ${image} not found locally, pulling before execution...`,
    );

    const pull = await this.runDockerCommand(
      ['pull', image],
      this.IMAGE_PULL_TIMEOUT_MS,
    );

    if (pull.code !== 0) {
      const detail = pull.stderr || pull.stdout || 'unknown pull error';
      throw new Error(`Failed to pull Docker image ${image}: ${detail}`);
    }

    this.readyImages.add(image);
    this.logger.log(`Docker image ${image} is ready.`);
  }

  private runDockerCommand(
    args: string[],
    timeoutMs: number,
  ): Promise<{ code: number | null; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const proc = spawn(this.DOCKER_BIN, args, {
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';
      let finished = false;

      const finish = (code: number | null) => {
        if (finished) {
          return;
        }

        finished = true;
        resolve({ code, stdout, stderr });
      };

      const timer = setTimeout(() => {
        try {
          proc.kill('SIGTERM');
        } catch {
          // ignore
        }

        setTimeout(() => {
          try {
            proc.kill('SIGKILL');
          } catch {
            // ignore
          }
        }, 300);
      }, timeoutMs);

      proc.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      proc.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on('error', (error: NodeJS.ErrnoException) => {
        clearTimeout(timer);
        const message =
          error.code === 'ENOENT'
            ? `Docker CLI "${this.DOCKER_BIN}" was not found.`
            : String(error);
        stderr = `${stderr}${stderr ? '\n' : ''}${message}`;
        finish(1);
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        finish(code);
      });
    });
  }

  private execSandbox(
    cmd: string,
    image: string,
    cwd: string,
    input: string,
    timeLimit: number,
    memoryLimit: number,
  ): Promise<RunResultDto> {
    return new Promise((resolve) => {
      const containerName = `coderank-run-${randomUUID()}`;
      const dockerCmd = [
        'run',
        '--rm',
        '-i',
        '--name',
        containerName,
        '--network',
        'none',
        '--cpus',
        '1',
        '--memory',
        `${memoryLimit}m`,
        '--pids-limit',
        '128',
        '--workdir',
        '/workspace',
        '--mount',
        `type=bind,src=${cwd},dst=/workspace`,
        image,
        'sh',
        '-lc',
        cmd,
      ];

      const proc = spawn(this.DOCKER_BIN, dockerCmd, {
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';
      let killedByTimeout = false;
      let stdoutFirstSeen = false;
      let stderrFirstSeen = false;
      let settled = false;
      let timeout: NodeJS.Timeout | null = null;
      let killTimer: NodeJS.Timeout | null = null;

      const start = Date.now();
      this.logger.debug(
        `spawned pid=${proc.pid} cmd=${this.DOCKER_BIN} ${dockerCmd.join(' ')} start=${start}`,
      );

      const finalize = (result: RunResultDto) => {
        if (settled) {
          return;
        }

        settled = true;
        if (timeout) {
          clearTimeout(timeout);
        }
        if (killTimer) {
          clearTimeout(killTimer);
        }
        resolve(result);
      };

      proc.on('error', (error: NodeJS.ErrnoException) => {
        const message =
          error.code === 'ENOENT'
            ? `Docker CLI "${this.DOCKER_BIN}" was not found. Install Docker Desktop/Engine and ensure Docker is on PATH.`
            : `Failed to start sandbox process: ${String(error)}`;

        this.logger.error(message);
        finalize({
          status: RunStatusEnum.RE,
          stdout,
          stderr: `${stderr}${stderr ? '\n' : ''}${message}`,
          time: Date.now() - start,
          memory: 0,
        });
      });

      if (input.length > 0) {
        const inputToWrite = input.endsWith('\n') ? input : `${input}\n`;
        try {
          proc.stdin.write(inputToWrite);
          this.logger.debug(
            `stdin written len=${inputToWrite.length} (was ${input.length})`,
          );
        } catch (error) {
          this.logger.debug(`failed to write stdin: ${String(error)}`);
        }
      }
      proc.stdin.end();

      proc.stdout.on('data', (d: Buffer) => {
        if (!stdoutFirstSeen) {
          stdoutFirstSeen = true;
          this.logger.debug(
            `stdout first @${Date.now() - start}ms data=${d.toString().slice(0, 200)}`,
          );
        }

        stdout += d.toString();
      });

      proc.stderr.on('data', (d: Buffer) => {
        if (!stderrFirstSeen) {
          stderrFirstSeen = true;
          this.logger.debug(
            `stderr first @${Date.now() - start}ms data=${d.toString().slice(0, 200)}`,
          );
        }
        stderr += d.toString();
      });

      proc.on('exit', (code, signal) => {
        this.logger.debug(
          `exit code=${code} signal=${signal} time=${Date.now() - start}ms`,
        );
      });

      timeout = setTimeout(() => {
        killedByTimeout = true;
        this.logger.debug(
          `timeout triggered after ${timeLimit}ms, terminating container ${containerName}`,
        );

        this.killContainer(containerName);
        try {
          proc.kill('SIGTERM');
        } catch (e) {
          this.logger.debug(`failed to send SIGTERM: ${e}`);
        }

        // If still alive after short grace period, force kill
        killTimer = setTimeout(() => {
          this.logger.debug(`force killing pid=${proc.pid} with SIGKILL`);
          this.killContainer(containerName);
          try {
            proc.kill('SIGKILL');
          } catch (e) {
            this.logger.debug(`failed to send SIGKILL: ${e}`);
          }
        }, 200);
      }, timeLimit);

      proc.on('close', (code) => {
        const time = Date.now() - start;
        this.logger.debug(
          `close code=${code} killedByTimeout=${killedByTimeout} totalTime=${time}ms`,
        );

        if (killedByTimeout) {
          return finalize({
            status: RunStatusEnum.TLE,
            stdout,
            stderr,
            time,
            memory: 0,
          });
        }

        if (code === 137) {
          return finalize({
            status: RunStatusEnum.MLE,
            stdout,
            stderr,
            time,
            memory: 0,
          });
        }

        if (code !== 0) {
          return finalize({
            status: RunStatusEnum.RE,
            stdout,
            stderr,
            time,
            memory: 0,
          });
        }

        finalize({ status: RunStatusEnum.OK, stdout, stderr, time, memory: 0 });
      });
    });
  }

  private killContainer(containerName: string): void {
    const killer = spawn(this.DOCKER_BIN, ['kill', containerName], {
      stdio: 'ignore',
    });

    killer.on('error', () => undefined);
  }
}
