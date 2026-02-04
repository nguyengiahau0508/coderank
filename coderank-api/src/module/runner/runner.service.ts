// coderunner/runner.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { RunCodeDto } from "./dto/run-code.dto";
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { randomUUID } from "crypto";
import { LanguageEnum } from "src/common/enums/enums";
import { RunResultDto, RunStatusEnum } from "./dto/run-result.dto";

@Injectable()
export class RunnerService {
  private readonly logger = new Logger(RunnerService.name);
  private readonly WORKDIR = "/tmp/coderank"; // đổi sang docker volume nếu production

  async runCode(dto: RunCodeDto) {
    const id = randomUUID();
    const dir = path.join(this.WORKDIR, id);
    await fs.mkdir(dir, { recursive: true });

    const timeLimit = dto.timeLimit ?? 2000;
    const memoryLimit = dto.memoryLimit ?? 256; // MB

    let execCmd: string;
    let compileCmd: string | null = null;

    // -------- Handle language ----------
    switch (dto.language) {
      case LanguageEnum.PYTHON: {
        const file = path.join(dir, "main.py");
        await fs.writeFile(file, dto.code);
        execCmd = `python3 main.py`;
        break;
      }

      case LanguageEnum.CPP: {
        const file = path.join(dir, "main.cpp");
        const bin = path.join(dir, "main.out");
        await fs.writeFile(file, dto.code);
        compileCmd = `g++ main.cpp -O2 -std=c++17 -o main.out`;
        execCmd = `./main.out`;
        break;
      }

      default: {
        throw new Error(`Unsupported language: ${dto.language}`);
      }
    }

    // -------- Compile ----------
    if (compileCmd) {
      const compileRes = await this.execSandbox(compileCmd, dir, "", timeLimit, memoryLimit);
      if (compileRes.status !== RunStatusEnum.OK) {
        return { ...compileRes, status: RunStatusEnum.CE };
      }
    }

    // -------- Run ----------
    return this.execSandbox(execCmd, dir, dto.input, timeLimit, memoryLimit);
  }

  private execSandbox(
    cmd: string,
    cwd: string,
    input: string,
    timeLimit: number,
    memoryLimit: number
  ): Promise<RunResultDto> {
    return new Promise((resolve) => {

      const firejailCmd = [
        "firejail",
        "--quiet",
        "--net=none",
        `--private=${cwd}`,
        `--rlimit-as=${memoryLimit * 1024 * 1024}`,
        "--",
        "bash",
        "-c",
        cmd,
      ];

      const proc = spawn(firejailCmd[0], firejailCmd.slice(1), {
        cwd,
        stdio: "pipe",
      });

      let stdout = "";
      let stderr = "";
      let killedByTimeout = false;
      let stdoutFirstSeen = false;
      let stderrFirstSeen = false;
      let killTimer: NodeJS.Timeout | null = null;

      const start = Date.now();
      this.logger.debug(`spawned pid=${proc.pid} cmd=${firejailCmd.join(' ')} start=${start}`);
      
      const inputToWrite = input.endsWith('\n') ? input : input + '\n';
      proc.stdin.write(inputToWrite);
      proc.stdin.end();
      this.logger.debug(`stdin written len=${inputToWrite.length} (was ${input.length})`);

      proc.stdout.on("data", (d) => {
        if (!stdoutFirstSeen) {
          stdoutFirstSeen = true;
          this.logger.debug(`stdout first @${Date.now() - start}ms data=${d.toString().slice(0, 200)}`);
        }
        stdout += d.toString();
      });

      proc.stderr.on("data", (d) => {
        if (!stderrFirstSeen) {
          stderrFirstSeen = true;
          this.logger.debug(`stderr first @${Date.now() - start}ms data=${d.toString().slice(0, 200)}`);
        }
        stderr += d.toString();
      });

      proc.on("exit", (code, signal) => {
        this.logger.debug(`exit code=${code} signal=${signal} time=${Date.now() - start}ms`);
      });

      const timeout = setTimeout(() => {
        killedByTimeout = true;
        this.logger.debug(`timeout triggered after ${timeLimit}ms, sending SIGTERM to pid=${proc.pid}`);
        try {
          proc.kill("SIGTERM");
        } catch (e) {
          this.logger.debug(`failed to send SIGTERM: ${e}`);
        }

        // If still alive after short grace period, force kill
        killTimer = setTimeout(() => {
          this.logger.debug(`force killing pid=${proc.pid} with SIGKILL`);
          try {
            proc.kill("SIGKILL");
          } catch (e) {
            this.logger.debug(`failed to send SIGKILL: ${e}`);
          }
        }, 200);
      }, timeLimit);

      proc.on("close", (code) => {
        clearTimeout(timeout);
        if (killTimer) {
          clearTimeout(killTimer);
        }
        const time = Date.now() - start;
        this.logger.debug(`close code=${code} killedByTimeout=${killedByTimeout} totalTime=${time}ms`);

        if (killedByTimeout) {
          return resolve({ status: RunStatusEnum.TLE, stdout, stderr, time, memory: 0 });
        }

        if (code !== 0) {
          return resolve({ status: RunStatusEnum.RE, stdout, stderr, time, memory: 0 });
        }

        resolve({ status: RunStatusEnum.OK, stdout, stderr, time, memory: 0 });
      });
    });
  }
}