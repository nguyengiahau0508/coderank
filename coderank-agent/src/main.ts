import express, {Request, Response} from 'express';
import { config } from './config';
import cors from 'cors';
import { Agent } from './core/agent/agent';

const PORT = config.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/agent/query', async (req: Request, res: Response) => {
  const { userToken, message, role } = req.body;

  // Kiểm tra input cơ bản
  if (!userToken || !message) {
    return res.status(400).json({ error: 'Missing userToken or message' });
  }

  // Header bảo mật để đảm bảo chỉ NestJS được gọi Agent này
  // const agentSecret = req.headers['x-agent-secret'];
  // if (agentSecret !== config.AGENT_SECRET_TOKEN) {
  //   return res.status(403).json({ error: 'Unauthorized access' });
  // }

  // Lấy cấu hình tùy chọn từ request body
  const providerName = req.body.provider || config.DEFAULT_MODEL_PROVIDER;
  const modelName = req.body.modelName; // Tuỳ chọn
  const providerConfig = {
    apiKey: req.body.apiKey,
    baseHost: req.body.baseHost // Dành cho Ollama
  };

  try {
    // Khởi tạo Agent với cấu hình tùy chỉnh
    const agent = new Agent(role, providerName, modelName, providerConfig);
    const response = await agent.processQuery(userToken, message);

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



