import express, {Request, Response} from 'express';
import 'dotenv/config';
import cors from 'cors';
import { processUserQuery } from './agents/executor';

const PORT = Number(process.env.PORT) || 4000;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/agent/query', async (req: Request, res: Response) => {
  const { userToken, message } = req.body;

  // Kiểm tra input cơ bản
  if (!userToken || !message) {
    return res.status(400).json({ error: 'Missing userToken or message' });
  }

  // Header bảo mật để đảm bảo chỉ NestJS được gọi Agent này
  const agentSecret = req.headers['x-agent-secret'];
  if (agentSecret !== process.env.AGENT_SECRET_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    // Gọi reasoning loop đã viết ở file executor.ts
    const response = await processUserQuery(userToken, message);

    return res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error(`[Agent Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal Agent Error',
      details: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});



