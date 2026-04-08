import * as fs from 'fs/promises';
import * as path from 'path';
import {
  Session,
  ISessionManager,
  SESSION_VERSION,
} from './session.interface';
import { SessionBuilder } from './session.builder';

/**
 * File-based session manager for persisting conversation sessions.
 * Sessions are stored as JSON files in the configured storage directory.
 */
export class SessionManager implements ISessionManager {
  private storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  /**
   * Ensure the storage directory exists.
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Get the file path for a session.
   */
  private getSessionPath(sessionId: string): string {
    // Sanitize session ID to prevent path traversal
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(this.storagePath, `${safeId}.json`);
  }

  /**
   * Create a new session.
   */
  create(metadata?: Session['metadata']): Session {
    return SessionBuilder.createSession(metadata);
  }

  /**
   * Save a session to disk.
   */
  async save(session: Session): Promise<void> {
    await this.ensureDirectory();
    
    // Update the timestamp
    const updatedSession: Session = {
      ...session,
      updatedAt: new Date().toISOString(),
    };

    const filePath = this.getSessionPath(session.id);
    const content = JSON.stringify(updatedSession, null, 2);
    
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Load a session from disk.
   * Returns null if the session doesn't exist.
   */
  async load(sessionId: string): Promise<Session | null> {
    const filePath = this.getSessionPath(sessionId);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const session = JSON.parse(content) as Session;

      // Migrate if needed
      return this.migrate(session);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all session IDs.
   */
  async list(): Promise<string[]> {
    await this.ensureDirectory();

    try {
      const files = await fs.readdir(this.storagePath);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Delete a session.
   */
  async delete(sessionId: string): Promise<void> {
    const filePath = this.getSessionPath(sessionId);

    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Check if a session exists.
   */
  async exists(sessionId: string): Promise<boolean> {
    const filePath = this.getSessionPath(sessionId);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get session metadata without loading full content.
   */
  async getMetadata(sessionId: string): Promise<{
    id: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    metadata?: Session['metadata'];
  } | null> {
    const session = await this.load(sessionId);
    if (!session) return null;

    return {
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      metadata: session.metadata,
    };
  }

  /**
   * Clean up old sessions.
   * @param maxAgeMs Maximum age in milliseconds (default: 7 days)
   */
  async cleanup(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const sessionIds = await this.list();
    const now = Date.now();
    let deletedCount = 0;

    for (const sessionId of sessionIds) {
      const session = await this.load(sessionId);
      if (session) {
        const updatedAt = new Date(session.updatedAt).getTime();
        if (now - updatedAt > maxAgeMs) {
          await this.delete(sessionId);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Migrate session schema if needed.
   */
  private migrate(session: Session): Session {
    // No migrations needed for version 1
    if (session.version === SESSION_VERSION) {
      return session;
    }

    // Future migrations would go here
    // For now, just update the version
    return {
      ...session,
      version: SESSION_VERSION,
    };
  }
}

/**
 * In-memory session manager for testing or stateless operation.
 */
export class InMemorySessionManager implements ISessionManager {
  private sessions = new Map<string, Session>();

  create(metadata?: Session['metadata']): Session {
    const session = SessionBuilder.createSession(metadata);
    this.sessions.set(session.id, session);
    return session;
  }

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id, {
      ...session,
      updatedAt: new Date().toISOString(),
    });
  }

  async load(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) || null;
  }

  async list(): Promise<string[]> {
    return Array.from(this.sessions.keys());
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  clear(): void {
    this.sessions.clear();
  }
}
