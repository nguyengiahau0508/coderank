import { Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RuntimeLoopService } from '../core/agent/runtime-loop.service';
import { RUNTIME_LOOP } from '../core/agent/runtime.tokens';
import { AgentStatus } from '../domain/status.enums';
import { AgentRecord } from '../domain/types';
import { PermissionPolicyService } from '../permissions/permission-policy.service';
import { SessionContextService } from '../sessions/session-context.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentService {
  private readonly agents = new Map<string, AgentRecord>();
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly runtimeAccessTokens = new Map<string, string>();

  constructor(
    private readonly permissions: PermissionPolicyService,
    private readonly moduleRef: ModuleRef,
    private readonly sessions: SessionContextService,
  ) {}

  async createAndStart(
    dto: CreateAgentDto,
    context?: { accessToken?: string },
  ): Promise<AgentRecord> {
    const now = new Date().toISOString();
    const subagentType = dto.subagentType ?? 'task-specialist';
    const allowedTools =
      dto.allowedTools ??
      this.permissions.allowedToolsForSubagent(subagentType);
    const sessionContextSnapshot = dto.sessionId
      ? this.sessions.getContextSummary(dto.sessionId)
      : undefined;

    const agent: AgentRecord = {
      id: randomUUID(),
      status: AgentStatus.CREATED,
      subagentType,
      prompt: dto.prompt,
      systemPrompt: dto.systemPrompt,
      sessionId: dto.sessionId,
      sessionContextSnapshot,
      allowedTools,
      createdAt: now,
      updatedAt: now,
    };

    this.agents.set(agent.id, agent);
    const accessToken = context?.accessToken?.trim();
    if (accessToken) {
      this.runtimeAccessTokens.set(agent.id, accessToken);
    }
    await this.persistArtifacts(agent);
    this.spawn(agent.id);
    return agent;
  }

  get(agentId: string): AgentRecord {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new NotFoundException(`Agent "${agentId}" not found`);
    }
    return agent;
  }

  list(): AgentRecord[] {
    return Array.from(this.agents.values());
  }

  async stop(agentId: string): Promise<AgentRecord> {
    const current = this.get(agentId);
    this.abortControllers.get(agentId)?.abort();
    this.runtimeAccessTokens.delete(agentId);

    const stopped: AgentRecord = {
      ...current,
      status: AgentStatus.STOPPED,
      updatedAt: new Date().toISOString(),
    };
    this.agents.set(agentId, stopped);
    await this.persistArtifacts(stopped);
    return stopped;
  }

  private spawn(agentId: string): void {
    setImmediate(() => {
      void this.runAgentJob(agentId);
    });
  }

  private async runAgentJob(agentId: string): Promise<void> {
    const existing = this.get(agentId);
    if (existing.status === AgentStatus.STOPPED) {
      return;
    }

    const runtime = this.moduleRef.get<RuntimeLoopService>(RUNTIME_LOOP, {
      strict: false,
    });
    const abortController = new AbortController();
    this.abortControllers.set(agentId, abortController);
    const accessToken = this.runtimeAccessTokens.get(agentId);
    const systemPrompt = this.composeSystemPrompt(
      existing.systemPrompt,
      existing.sessionId,
    );
    await this.patch(agentId, {
      status: AgentStatus.RUNNING,
      error: undefined,
      sessionContextSnapshot: existing.sessionId
        ? this.sessions.getContextSummary(existing.sessionId)
        : undefined,
    });

    try {
      const result = await runtime.runTurn({
        prompt: existing.prompt,
        systemPrompt,
        allowedTools: existing.allowedTools,
        subagentType: existing.subagentType,
        abortSignal: abortController.signal,
        accessToken,
      });

      await this.patch(agentId, {
        status: AgentStatus.COMPLETED,
        finalOutput: result.finalMessage,
      });
      if (existing.sessionId) {
        this.sessions.appendTurn(existing.sessionId, {
          userMessage: existing.prompt,
          assistantMessage: result.finalMessage,
        });
      }
      await this.persistOutput(agentId, result.finalMessage);
    } catch (error) {
      if (abortController.signal.aborted) {
        await this.patch(agentId, { status: AgentStatus.STOPPED });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown runtime error';
        await this.patch(agentId, {
          status: AgentStatus.FAILED,
          error: errorMessage,
        });
        if (existing.sessionId) {
          this.sessions.appendTurn(existing.sessionId, {
            userMessage: existing.prompt,
            assistantMessage: `Failure: ${errorMessage}`,
          });
        }
      }
    } finally {
      this.abortControllers.delete(agentId);
      this.runtimeAccessTokens.delete(agentId);
    }
  }

  private async patch(
    agentId: string,
    partial: Partial<AgentRecord>,
  ): Promise<AgentRecord> {
    const current = this.get(agentId);
    const updated: AgentRecord = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.agents.set(agentId, updated);
    await this.persistArtifacts(updated);
    return updated;
  }

  private async persistArtifacts(agent: AgentRecord): Promise<void> {
    const agentDir = join(process.cwd(), '.claw', 'agents', agent.id);
    await mkdir(agentDir, { recursive: true });
    await writeFile(
      join(agentDir, 'manifest.json'),
      JSON.stringify(agent, null, 2),
      'utf8',
    );
  }

  private async persistOutput(agentId: string, output: string): Promise<void> {
    const agentDir = join(process.cwd(), '.claw', 'agents', agentId);
    await mkdir(agentDir, { recursive: true });
    await writeFile(join(agentDir, 'output.md'), `${output}\n`, 'utf8');
  }

  private composeSystemPrompt(
    baseSystemPrompt: string | undefined,
    sessionId: string | undefined,
  ): string | undefined {
    if (!sessionId) {
      return baseSystemPrompt;
    }

    const contextSummary = this.sessions.getContextSummary(sessionId);
    const contextBlock = [
      'Session context summary:',
      contextSummary,
      'Use this summary as the high-level conversation context for the current user prompt.',
    ].join('\n');

    return baseSystemPrompt
      ? `${baseSystemPrompt}\n\n${contextBlock}`
      : contextBlock;
  }
}
