# CodeRank

**Nền tảng luyện tập thuật toán và học tập trực tuyến** — Hệ thống tích hợp bài tập lập trình, khóa học, cuộc thi, và trợ lý AI.

---

## Tổng quan

CodeRank là một nền tảng giáo dục công nghệ giúp người dùng rèn luyện kỹ năng lập trình thông qua:

- **Giải bài tập thuật toán** — Hệ thống bài tập với nhiều cấp độ, chấm điểm tự động
- **Khóa học có cấu trúc** — Bài giảng, bài tập, quiz theo lộ trình rõ ràng
- **Cuộc thi lập trình** — Tổ chức và tham gia các cuộc thi trực tuyến
- **Trợ lý AI thông minh** — Hỗ trợ giải bài, phân tích code, gợi ý lời giải
- **Bảng xếp hạng** — Theo dõi tiến trình và so sánh với cộng đồng

## Kiến trúc hệ thống

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  coderank-client│────▶│   coderank-api  │◀────│  coderank-agent │
│  Angular 21     │     │   NestJS 11     │     │  Express + LLM  │
│  :4200          │     │   :3000         │     │  :4000          │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │    MariaDB      │
                        │    :3306        │
                        └─────────────────┘
```

| Thành phần | Công nghệ | Mô tả |
|---|---|---|
| **Client** | Angular 21, PrimeNG 21, Tailwind CSS 4, Monaco Editor | Giao diện web SPA, theo vai trò người dùng |
| **API** | NestJS 11, TypeORM, MariaDB, BullMQ | REST API, xác thực, xử lý logic nghiệp vụ |
| **Agent** | Express, Google Gemini / Ollama / Groq | Trợ lý AI với agentic loop và tool calling |
| **Database** | MariaDB | Cơ sở dữ liệu quan hệ |

## Tính năng chính

### Vai trò người dùng

| Vai trò | Khả năng |
|---|---|
| **Student** | Giải bài tập, xem khóa học, tham gia cuộc thi, xem bảng xếp hạng |
| **Instructor** | Tạo/quản lý bài tập, khóa học, xem phân tích kết quả sinh viên |
| **Admin** | Quản lý toàn bộ hệ thống, người dùng, thống kê |
| **Problem Setter** | Tạo và quản lý bài tập lập trình |

### Hệ thống bài tập
- Hỗ trợ nhiều ngôn ngữ: Python, C++, Java, JavaScript, TypeScript, C, Go, Rust
- Phân loại theo độ khó: Easy, Medium, Hard
- Test cases tự động với nhiều kiểu so sánh (exact, trim whitespace, tokenize)
- Gợi ý (hints) theo bậc
- Sandbox cách ly bằng Firejail (giới hạn thời gian & bộ nhớ)

### Khóa học
- Tổ chức theo: Khóa học → Phần → Bài học
- Cấp độ: Beginner, Intermediate, Advanced
- Trạng thái: Draft, Published, Archived
- Theo dõi tiến trình đăng ký và hoàn thành

### Trợ lý AI
- Agentic loop tối đa 10 vòng lặp với tool calling
- Hỗ trợ nhiều LLM: Google Gemini, Ollama (local), Groq
- Phân tích code, gợi ý lời giải, debug lỗi
- Truy xuất dữ liệu từ platform thông qua tool system

### Bảo mật
- Xác thực JWT + OAuth (Google, GitHub)
- Phân quyền theo vai trò (Role-based Access Control)
- Sandbox cách ly code thực thi (Firejail)
- Helmet, CSRF, Rate Limiting
- XSS prevention (DOMPurify)

## Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MariaDB** >= 10.6
- **Firejail** (cho code execution sandbox)
- **Git**

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd coderank
```

### 2. Cài đặt API

```bash
cd coderank-api
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin môi trường của bạn
```

### 3. Cài đặt Client

```bash
cd coderank-client
npm install
```

### 4. Cài đặt Agent

```bash
cd coderank-agent
npm install
cp .env.example .env
# Cấu hình LLM provider và API key
```

### 5. Thiết lập Database

```bash
# Tạo database trong MariaDB
mysql -u root -p -e "CREATE DATABASE coderank;"

# Seed dữ liệu mẫu
cd coderank-api
npm run seed
```

## Chạy ứng dụng

### Development

```bash
# Terminal 1 — API
cd coderank-api
npm run start:dev

# Terminal 2 — Client
cd coderank-client
npm start

# Terminal 3 — Agent (tùy chọn)
cd coderank-agent
npm run dev
```

### Production

```bash
# Build API
cd coderank-api
npm run build
npm run start:prod

# Build Client
cd coderank-client
npm run build

# Run Agent
cd coderank-agent
npm start
```

## Cấu hình môi trường

### API (`coderank-api/.env`)

| Biến | Mô tả | Mặc định |
|---|---|---|
| `APP_PORT` | Port của API server | `3000` |
| `APP_ENV` | Môi trường (development/production) | `development` |
| `CLIENT_URL` | URL của client app | `http://localhost:4200` |
| `DB_MARIADB_HOST` | MariaDB host | `localhost` |
| `DB_MARIADB_PORT` | MariaDB port | `3306` |
| `DB_MARIADB_USERNAME` | MariaDB username | `root` |
| `DB_MARIADB_PASSWORD` | MariaDB password | — |
| `DB_MARIADB_NAME` | Tên database | — |
| `AUTH_JWT_ACCESS_TOKEN_SECRET` | Secret cho access token | — |
| `AUTH_JWT_REFRESH_TOKEN_SECRET` | Secret cho refresh token | — |

> Xem đầy đủ tại [`coderank-api/.env.example`](coderank-api/.env.example)

### Agent (`coderank-agent/.env`)

| Biến | Mô tả | Mặc định |
|---|---|---|
| `PORT` | Port của agent server | `4000` |
| `DEFAULT_MODEL_PROVIDER` | LLM provider (`gemini` / `ollama` / `groq`) | `gemini` |
| `GEMINI_API_KEY` | API key cho Google Gemini | — |
| `NESTJS_API_URL` | URL kết nối tới API | `http://localhost:3000/api` |

> Xem đầy đủ tại [`coderank-agent/.env.example`](coderank-agent/.env.example)

## API Documentation

Sau khi chạy API server, truy cập Swagger UI tại:

```
http://localhost:3000/api-docs
```

### Endpoint chính

| Nhóm | Prefix | Mô tả |
|---|---|---|
| Auth | `/api/auth` | Đăng nhập, đăng ký, OAuth |
| Problems | `/api/problems` | CRUD bài tập, testcases, submissions |
| Courses | `/api/courses` | Khóa học, bài giảng, đăng ký |
| Contests | `/api/contests` | Quản lý cuộc thi |
| Users | `/api/users` | Quản lý người dùng, hồ sơ |
| Agent | `/agent/query` | Truy vấn trợ lý AI (port 4000) |

## Cấu trúc thư mục

```
coderank/
├── CLAUDE.md                    # Hướng dẫn cho Claude Code
├── README.md                    # File này
├── coderank-api/                # Backend API
│   ├── CLAUDE.md
│   ├── .env.example
│   ├── src/
│   │   ├── main.ts              # Entry point
│   │   ├── app.module.ts        # Root module
│   │   ├── auth/                # Xác thực & phân quyền
│   │   ├── common/              # Shared code (entities, DTOs, enums, ...)
│   │   ├── config/              # Config modules (app, db, auth, integrations)
│   │   ├── db/                  # Data source & seeds
│   │   ├── integrations/        # Google Drive, local storage
│   │   ├── modules/             # Domain modules
│   │   │   ├── problems/        # Bài tập
│   │   │   ├── courses/         # Khóa học
│   │   │   ├── contests/        # Cuộc thi
│   │   │   ├── runner/          # Code execution
│   │   │   └── users/           # Người dùng
│   │   └── providers/           # Provider modules
│   └── test/                    # E2E tests
├── coderank-client/             # Frontend
│   ├── CLAUDE.md
│   ├── src/
│   │   ├── main.ts              # Bootstrap
│   │   ├── app/
│   │   │   ├── features/        # Feature modules (student, lecturer, admin)
│   │   │   ├── core/            # Services, guards, interceptors
│   │   │   ├── data/            # Models, API services
│   │   │   ├── layouts/         # Layout theo vai trò
│   │   │   └── shared/          # Shared components
│   │   └── environments/        # Cấu hình môi trường
│   └── public/                  # Static assets (Monaco Editor)
└── coderank-agent/              # AI Agent
    ├── CLAUDE.md
    ├── .env.example
    └── src/
        ├── main.ts              # Express server
        ├── api/                 # API client
        ├── config/              # Cấu hình
        ├── core/
        │   ├── agent/           # Agentic loop
        │   ├── llm/             # LLM providers
        │   └── tools/           # Tool system
        └── prompts/             # System prompts
```

## Công nghệ sử dụng

### Frontend
- [Angular](https://angular.dev/) 21 — Framework SPA
- [PrimeNG](https://primeng.org/) 21 — Component library
- [Tailwind CSS](https://tailwindcss.com/) 4 — Utility-first CSS
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — Code editor
- [Quill](https://quilljs.com/) — Rich text editor

### Backend
- [NestJS](https://nestjs.com/) 11 — Node.js framework
- [TypeORM](https://typeorm.io/) — ORM
- [MariaDB](https://mariadb.org/) — Database
- [BullMQ](https://docs.bullmq.io/) — Task queue
- [Passport](https://www.passportjs.org/) — Authentication

### AI Agent
- [Google Generative AI](https://ai.google.dev/) — Gemini models
- [Ollama](https://ollama.ai/) — Local LLM
- [Groq](https://groq.com/) — Fast inference
- [Zod](https://zod.dev/) — Schema validation

## Testing

```bash
# API — Unit tests
cd coderank-api && npm test

# API — E2E tests
cd coderank-api && npm run test:e2e

# Client — Tests
cd coderank-client && npm test
```

## Làm việc với Claude Code

Dự án đã được cấu hình để làm việc tối ưu với Claude Code:

- **`CLAUDE.md`** — File hướng dẫn ở root và mỗi subproject giúp Claude Code hiểu ngữ cảnh dự án
- **`.env.example`** — Mẫu biến môi trường cho API và Agent
- Cấu trúc thư mục rõ ràng, convention nhất quán giúp Claude Code navigate hiệu quả

### Hướng dẫn AI xây dựng UI

> **Prompt mẫu cho AI khi xây dựng giao diện:**
>
> Build a minimal developer tools landing page with dark mode, code snippet previews, feature comparison table, integration logos, and documentation link. Use syntax highlighting colors.

**Chi tiết yêu cầu thiết kế:**

- **Dark mode** — Giao diện tối làm chủ đạo, phù hợp với developer tools. Nền tối (`#0d1117`, `#161b22`), text sáng (`#c9d1d9`, `#f0f6fc`)
- **Code snippet previews** — Hiển thị đoạn code mẫu với syntax highlighting, sử dụng Monaco Editor hoặc block code có màu sắc (keyword: `#ff7b72`, string: `#a5d6ff`, function: `#d2a8ff`, comment: `#8b949e`)
- **Feature comparison table** — Bảng so sánh tính năng giữa các plan/tier hoặc giữa CodeRank với các nền tảng khác, sử dụng PrimeNG Table component
- **Integration logos** — Grid hiển thị logo các công nghệ/ngôn ngữ được hỗ trợ (Python, C++, Java, JavaScript, TypeScript, Go, Rust, C)
- **Documentation link** — CTA button/link dẫn tới tài liệu API (`/api-docs`) và hướng dẫn sử dụng
- **Syntax highlighting colors** — Áp dụng bảng màu syntax highlighting xuyên suốt UI cho headings, badges, accents để tạo cảm giác "code editor"

**Tech stack cho UI:**
- Angular 21 standalone components
- PrimeNG 21 (Aura dark preset)
- Tailwind CSS 4 utility classes
- Responsive design (mobile-first)

## License

Private — All rights reserved.
