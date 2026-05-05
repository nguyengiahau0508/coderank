# coderank-agent

NestJS implementation của AI agent runtime theo kiến trúc:

1. **Tool contract + dispatcher**: `src/core/tools`
2. **Registry/state machine runtime**: `src/tasks`, `src/workers`, `src/agents`
3. **LLM loop + tool execution**: `src/core/agent`, `src/core/llm`

## Modules

- `agents`: tạo/chạy/stop sub-agent nền, ghi `.claw/agents/<id>/manifest.json` và `output.md`
- `tasks`: task lifecycle in-memory (`create/get/list/stop/update/output`)
- `workers`: worker boot state machine + ghi `.claw/worker-state.json`
- `runtime`: vòng lặp model -> tool call -> execute -> tool result -> continue
- `sessions`: session context memory (tóm tắt đại ý theo từng lượt hội thoại)
- `tools`: catalog `mvpToolSpecs()` + dispatcher có permission gate
- `providers`: provider abstraction (mặc định **ollama**, có thể chuyển qua mock)
- `permissions`: policy theo role/subagent type
- `events`: in-memory event store cho worker/task observability

## REST API

- `POST /agents`, `GET /agents`, `GET /agents/:id`, `POST /agents/:id/stop`
- `POST /sessions`, `GET /sessions`, `GET /sessions/:id`, `GET /sessions/:id/context`, `POST /sessions/:id/turns`
- `POST /tasks`, `GET /tasks`, `GET /tasks/:id`, `POST /tasks/:id/stop`
- `POST /workers`, `GET /workers`, `GET /workers/:id`
- `POST /workers/:id/observe`, `POST /workers/:id/send-prompt`

## Chạy nhanh

```bash
npm install
npm run test
npm run build
```

## Cấu hình provider

- `LLM_PROVIDER=ollama` (mặc định) hoặc `LLM_PROVIDER=mock`
- `OLLAMA_BASE_URL` mặc định: `http://127.0.0.1:11434`
- `OLLAMA_MODEL` mặc định: `qwen2.5:7b-instruct`

## Cấu hình coderank-api cho tool

- `CODERANK_API_BASE_URL` mặc định: `http://127.0.0.1:3000`
- `CODERANK_API_PROBLEMS_PATH` mặc định: `/problems`

Mọi API call từ tool sang `coderank-api` bắt buộc dùng access token từ request `Authorization` khi gọi `POST /agents`:

`Authorization: Bearer <user-access-token>`

## Multi-turn session context

1. Tạo session: `POST /sessions`
2. Gửi prompt qua `POST /agents` với cùng `sessionId`
3. Mỗi lượt agent hoàn tất sẽ tự append turn và cập nhật `contextSummary`

Kết quả: lượt hỏi sau sẽ dùng context summary hiện tại thay vì phải đọc lại toàn bộ lịch sử message.

Stopword filtering cho keyword extraction dùng 2 file:
- `src/sessions/stop_words_english.txt`
- `src/sessions/stop_words_vietnamese.txt`

## Tool mẫu: ProblemCreate

Tool `ProblemCreate` gọi `coderank-api` để tạo problem mới.

Payload mẫu:

```json
{
  "title": "Two Sum",
  "slug": "two-sum",
  "statement": "Find two numbers...",
  "difficulty": "easy",
  "tags": ["array", "hash-table"],
  "timeLimitMs": 1000,
  "memoryLimitMb": 256,
  "visibility": "public"
}
```
