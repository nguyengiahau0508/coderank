import express, { Request, Response, NextFunction } from 'express';
import { config } from './config';
import cors from 'cors';
import { Agent } from './core/agent/agent';
import { AssignmentSubmissionGrader } from './core/agent/assignment-submission-grader';

const PORT = config.PORT;

const app = express();

app.use(cors({ origin: config.NESTJS_API_URL.replace('/api', '') }));
app.use(express.json());

// Middleware: verify agent secret token (only NestJS API can call this service)
function verifyAgentSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-agent-secret'];
  if (!config.AGENT_SECRET_TOKEN || secret !== config.AGENT_SECRET_TOKEN) {
    return res.status(403).json({ success: false, error: 'Unauthorized: invalid agent secret' });
  }
  next();
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/agent/chat', verifyAgentSecret, async (req: Request, res: Response) => {
  const { userToken, message, role, provider, modelName, apiKey, baseHost, contextPolicy, history, context } = req.body;

  if (!userToken || !message) {
    return res.status(400).json({ success: false, error: 'Missing userToken or message' });
  }

  const llmConfig = (apiKey || baseHost || contextPolicy || history)
    ? { apiKey, baseHost, contextPolicy, initialHistory: history }
    : undefined;

  try {
    const agent = new Agent(role, provider, modelName, llmConfig);
    const responseText = await agent.processQuery(userToken, message, context);

    return res.json({
      success: true,
      data: { message: responseText },
    });
  } catch (error: any) {
    console.error(`[Agent Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal Agent Error',
      details: error.message,
    });
  }
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/agent/chat/stream', verifyAgentSecret, async (req: Request, res: Response) => {
  const { userToken, message, role, provider, modelName, apiKey, baseHost, contextPolicy, history, context } = req.body;

  if (!userToken || !message) {
    return res.status(400).json({ success: false, error: 'Missing userToken or message' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (event: { type: string; content?: string }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const llmConfig = (apiKey || baseHost || contextPolicy || history)
    ? { apiKey, baseHost, contextPolicy, initialHistory: history }
    : undefined;

  try {
    const agent = new Agent(role, provider, modelName, llmConfig);
    const responseText = await agent.processQueryStream(userToken, message, sendEvent, context);

    // Stream final text word-by-word
    const words = responseText.split(/(?<=\s)/);
    for (const word of words) {
      sendEvent({ type: 'token', content: word });
      await sleep(15);
    }

    sendEvent({ type: 'done' });
    res.end();
  } catch (error: any) {
    console.error(`[Agent Stream Error]: ${error.message}`);
    sendEvent({ type: 'error', content: error.message });
    res.end();
  }
});

app.post(
  '/agent/grade-assignment-submissions',
  verifyAgentSecret,
  async (req: Request, res: Response) => {
    const {
      userToken,
      role,
      provider,
      modelName,
      apiKey,
      baseHost,
      courseId,
      lessonId,
      assignmentId,
      submissionIds,
      similarityThreshold,
      defaultMaxScore,
      gradingCriteria,
      assignmentTitle,
      assignmentDescription,
    } = req.body ?? {};

    if (!userToken || !courseId || !lessonId || !assignmentId) {
      return res.status(400).json({
        success: false,
        error:
          'Missing required fields: userToken, courseId, lessonId, assignmentId',
      });
    }

    try {
      const grader = new AssignmentSubmissionGrader();
      const result = await grader.grade({
        userToken,
        role,
        provider,
        modelName,
        apiKey,
        baseHost,
        courseId,
        lessonId,
        assignmentId,
        submissionIds,
        similarityThreshold,
        defaultMaxScore,
        gradingCriteria,
        assignmentTitle,
        assignmentDescription,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(`[Assignment Grading Error]: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Assignment grading failed',
        details: error.message,
      });
    }
  },
);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CodeRank Agent] Running on port ${PORT}`);
});
