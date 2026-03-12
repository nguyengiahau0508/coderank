import express, { Request, Response, NextFunction } from 'express';
import { config } from './config';
import cors from 'cors';
import { Agent } from './core/agent/agent';

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
  const { userToken, message, role, provider, modelName, apiKey, baseHost } = req.body;

  if (!userToken || !message) {
    return res.status(400).json({ success: false, error: 'Missing userToken or message' });
  }

  const llmConfig = (apiKey || baseHost) ? { apiKey, baseHost } : undefined;

  try {
    const agent = new Agent(role, provider, modelName, llmConfig);
    const responseText = await agent.processQuery(userToken, message);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CodeRank Agent] Running on port ${PORT}`);
});
