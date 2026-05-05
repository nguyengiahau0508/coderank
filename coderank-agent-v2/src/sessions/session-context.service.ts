import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SessionRecord, SessionTurn } from '../domain/types';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionTurnDto } from './dto/session-turn.dto';

@Injectable()
export class SessionContextService {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly stopWords: Set<string>;

  constructor() {
    this.stopWords = this.loadStopWords();
  }

  create(dto: CreateSessionDto): SessionRecord {
    const now = new Date().toISOString();
    const initialContext = dto.initialContext?.trim();
    const session: SessionRecord = {
      id: randomUUID(),
      title: dto.title,
      contextSummary: initialContext
        ? `Current context: ${initialContext}`
        : 'Current context: New conversation session.',
      focusPoints: initialContext ? [initialContext] : [],
      keywords: initialContext ? this.extractKeywords(initialContext) : [],
      turns: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  get(sessionId: string): SessionRecord {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session "${sessionId}" not found`);
    }
    return session;
  }

  list(): SessionRecord[] {
    return Array.from(this.sessions.values());
  }

  appendTurn(sessionId: string, dto: SessionTurnDto): SessionRecord {
    const session = this.get(sessionId);
    const userMessage = dto.userMessage.trim();
    if (!userMessage) {
      throw new BadRequestException('userMessage must not be empty');
    }
    const assistantMessage = dto.assistantMessage?.trim();
    const turn: SessionTurn = {
      id: randomUUID(),
      userMessage,
      assistantMessage,
      createdAt: new Date().toISOString(),
    };

    const focusPoints = this.limitItems(
      [...session.focusPoints, this.normalizeFocusPoint(userMessage)],
      5,
    );
    const keywords = this.mergeKeywords(
      session.keywords,
      this.extractKeywords(
        [userMessage, assistantMessage].filter(Boolean).join(' '),
      ),
      14,
    );

    const updated: SessionRecord = {
      ...session,
      focusPoints,
      keywords,
      turns: this.limitItems([...session.turns, turn], 12),
      contextSummary: this.buildSummary(focusPoints, keywords),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(updated.id, updated);
    return updated;
  }

  getContextSummary(sessionId: string): string {
    return this.get(sessionId).contextSummary;
  }

  private buildSummary(focusPoints: string[], keywords: string[]): string {
    const focus = focusPoints.length
      ? focusPoints.join('; ')
      : 'No focus point captured yet';
    const topic = keywords.length ? keywords.join(', ') : 'general';
    return `Current context: ${focus}. Key topics: ${topic}.`;
  }

  private normalizeFocusPoint(text: string): string {
    const compact = text.replace(/\s+/g, ' ').trim();
    if (compact.length <= 140) {
      return compact;
    }
    return `${compact.slice(0, 137)}...`;
  }

  private extractKeywords(text: string): string[] {
    const normalized = this.normalizeText(text);
    const terms = normalized
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 3 && !this.stopWords.has(part));

    return Array.from(new Set(terms));
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private mergeKeywords(
    existing: string[],
    incoming: string[],
    maxItems: number,
  ): string[] {
    return this.limitItems([...existing, ...incoming], maxItems).filter(
      Boolean,
    );
  }

  private limitItems<T>(items: T[], maxItems: number): T[] {
    const unique: T[] = [];
    for (const item of items) {
      if (!unique.includes(item)) {
        unique.push(item);
      }
    }

    if (unique.length <= maxItems) {
      return unique;
    }
    return unique.slice(unique.length - maxItems);
  }

  private loadStopWords(): Set<string> {
    const english = this.readStopWordFile('stop_words_english.txt');
    const vietnamese = this.readStopWordFile('stop_words_vietnamese.txt');
    const allLines = [...english, ...vietnamese];
    const words = new Set<string>();

    for (const line of allLines) {
      const normalized = this.normalizeText(line);
      if (!normalized) {
        continue;
      }
      const tokens = normalized.split(/\s+/).map((token) => token.trim());
      for (const token of tokens) {
        if (token) {
          words.add(token);
        }
      }
    }

    return words;
  }

  private readStopWordFile(fileName: string): string[] {
    const candidates = [
      join(__dirname, fileName),
      join(process.cwd(), 'dist', 'sessions', fileName),
      join(process.cwd(), 'src', 'sessions', fileName),
    ];

    for (const path of candidates) {
      try {
        const raw = readFileSync(path, 'utf8');
        return raw
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
      } catch {
        // Try next candidate path.
      }
    }

    throw new Error(
      `Stopword file "${fileName}" not found. Checked: ${candidates.join(', ')}`,
    );
  }
}
