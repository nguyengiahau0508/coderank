import { SessionContextService } from './session-context.service';

describe('SessionContextService', () => {
  let service: SessionContextService;

  beforeEach(() => {
    service = new SessionContextService();
  });

  it('updates context summary with new turns', () => {
    const session = service.create({
      title: 'ai project',
      initialContext: 'Building NestJS AI backend',
    });

    service.appendTurn(session.id, {
      userMessage: 'API is slow when reading MongoDB',
      assistantMessage: 'Need profiling and query indexes',
    });
    const updated = service.appendTurn(session.id, {
      userMessage: 'How to optimize performance?',
    });

    expect(updated.contextSummary).toContain(
      'API is slow when reading MongoDB',
    );
    expect(updated.contextSummary).toContain('How to optimize performance?');
    expect(updated.contextSummary).toContain('mongodb');
    expect(updated.focusPoints.length).toBeGreaterThanOrEqual(2);
    expect(updated.turns).toHaveLength(2);
  });

  it('loads english and vietnamese stopwords from files', () => {
    const session = service.create({
      title: 'stopword test',
    });

    const updated = service.appendTurn(session.id, {
      userMessage: 'How to optimize API cho toi trong NestJS va MongoDB',
    });

    expect(updated.keywords).not.toContain('how');
    expect(updated.keywords).not.toContain('cho');
    expect(updated.keywords).not.toContain('toi');
    expect(updated.keywords).toContain('optimize');
    expect(updated.keywords).toContain('nestjs');
    expect(updated.keywords).toContain('mongodb');
  });
});
