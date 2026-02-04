// coderunner/runner.service.ts
import { Injectable } from "@nestjs/common";
import { RunCodeDto } from "./dto/run-code.dto";
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { randomUUID } from "crypto";
import { LanguageEnum } from "src/common/enums/enums";
import { RunResultDto, RunStatusEnum } from "./dto/run-result.dto";

@Injectable()
export class RunnerService {
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
      const start = Date.now();

      const firejailCmd = [
        "firejail",
        "--quiet",
        "--net=none",
        `--private=${cwd}`,
        `--rlimit-as=${memoryLimit * 1024 * 1024}`,
        `--timeout=0:0:${Math.ceil(timeLimit / 1000)}`,
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

      proc.stdin.write(input);
      proc.stdin.end();

      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));

      const timeout = setTimeout(() => {
        killedByTimeout = true;
        proc.kill("SIGKILL");
      }, timeLimit);

      proc.on("close", (code) => {
        clearTimeout(timeout);
        const time = Date.now() - start;

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