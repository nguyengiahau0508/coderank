<div align="center">

# 🏆 CodeRank

**Nền tảng lập trình thi đấu và học trực tuyến**

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-21-4CAF50)](https://primeng.org/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red)](#)

</div>

---

## 📖 Giới thiệu

**CodeRank** là nền tảng full-stack hỗ trợ lập trình thi đấu (competitive programming) và quản lý học trực tuyến (LMS). Hệ thống cho phép:

- 🧩 **Quản lý bài tập** — Tạo, chỉnh sửa bài tập kèm testcase, gợi ý, lời giải và chấm bài tự động
- 🏅 **Thi đấu trực tuyến** — Tổ chức contest có thời gian, bảng xếp hạng và quản lý thí sinh
- 📚 **Khóa học trực tuyến** — LMS đầy đủ với bài giảng, quiz, bài tập thực hành, chấm điểm
- ⚡ **Chấm bài tự động** — Code Runner chạy nền với BullMQ job queue
- 🤖 **AI Agent** — Trợ lý AI hỗ trợ giải bài và gợi ý học tập *(đang phát triển)*
- 🔍 **RAG Search** — Tìm kiếm ngữ nghĩa trên kho bài tập và tài liệu *(đang phát triển)*

---

## 🏗️ Kiến trúc tổng quan

```
coderank/
├── coderank-api/          # 🔙 Backend REST API (NestJS 11)
├── coderank-client/       # 🖥️ Frontend SPA (Angular 21)
├── coderank-agent/        # 🤖 AI Agent Service (đang phát triển)
├── coderank-rag/          # 🔍 RAG Search Engine (đang phát triển)
├── AGENTS.md              # 📋 Tài liệu handover cho developers
└── README.md              # 📖 Bạn đang ở đây
```

| Service | Mô tả | Tech Stack | Trạng thái |
|---------|--------|------------|------------|
| **[coderank-api](./coderank-api/)** | REST API, xác thực, chấm bài | NestJS, TypeORM, MariaDB, BullMQ | ✅ Hoạt động |
| **[coderank-client](./coderank-client/)** | Giao diện web SPA | Angular 21, PrimeNG, TailwindCSS 4 | ✅ Hoạt động |
| **[coderank-agent](./coderank-agent/)** | Trợ lý AI cho học tập | *(chưa xác định)* | 🚧 Đang phát triển |
| **[coderank-rag](./coderank-rag/)** | Tìm kiếm ngữ nghĩa RAG | *(chưa xác định)* | 🚧 Đang phát triển |

---

## 🛠️ Tech Stack

### Backend
| Thành phần | Công nghệ |
|------------|-----------|
| Framework | NestJS 11 (TypeScript 5.7) |
| Database | MariaDB (mysql2 driver) |
| ORM | TypeORM 0.3 |
| Auth | Passport.js (Google OAuth2, JWT) |
| Queue | BullMQ 5 (Redis) |
| WebSocket | Socket.IO |
| Docs | Swagger UI (`/api-docs`) |
| Testing | Jest 30 + Supertest |

### Frontend
| Thành phần | Công nghệ |
|------------|-----------|
| Framework | Angular 21 (Standalone Components) |
| UI Library | PrimeNG 21 (Aura theme) |
| Styling | TailwindCSS 4 |
| Code Editor | Monaco Editor |
| Rich Text | Quill 2 |
| Markdown | marked + DOMPurify |
| State | Angular Signals |
| Testing | Vitest 4 |

---

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống

- **Node.js** v18+
- **npm** v11+
- **MariaDB/MySQL**
- **Redis** (cho BullMQ job queue)

### 1. Clone repository

```bash
git clone <repo-url>
cd coderank
```

### 2. Cài đặt Backend

```bash
cd coderank-api
npm install
```

Tạo file `.env` (xem [coderank-api/README.md](./coderank-api/README.md) để biết chi tiết):

```env
APP_NAME=coderank-api
APP_ENV=development
APP_PORT=3000
CLIENT_URL=http://localhost:4200

DB_MARIADB_HOST=localhost
DB_MARIADB_PORT=3306
DB_MARIADB_USERNAME=root
DB_MARIADB_PASSWORD=your_password
DB_MARIADB_NAME=coderank

JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=15m

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

Khởi chạy:

```bash
npm run start:dev
```

### 3. Cài đặt Frontend

```bash
cd coderank-client
npm install
npm start
```

### 4. Truy cập

| Dịch vụ | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| Swagger UI | http://localhost:3000/api-docs |

---

## 📦 Các lệnh phổ biến

### Backend (`coderank-api/`)

```bash
npm run start:dev      # Chạy dev server (hot reload)
npm run build          # Build production
npm run start:prod     # Chạy production build
npm run lint           # Kiểm tra & sửa lỗi lint
npm run format         # Format code với Prettier
npm test               # Chạy unit tests
npm run test:e2e       # Chạy E2E tests
npm run test:cov       # Báo cáo test coverage
npm run seed           # Seed dữ liệu mẫu
```

### Frontend (`coderank-client/`)

```bash
npm start              # Chạy dev server (port 4200)
npm run build          # Build production
npm run watch          # Build ở chế độ watch
npm test               # Chạy unit tests (Vitest)
```

---

## 👥 Vai trò người dùng

CodeRank hỗ trợ 3 vai trò với quyền hạn khác nhau:

| Vai trò | Mô tả | Chức năng chính |
|---------|--------|-----------------|
| **Admin** | Quản trị viên | Quản lý toàn bộ hệ thống: người dùng, bài tập, contest, khóa học |
| **Lecturer** (Instructor) | Giảng viên | Tạo/quản lý bài tập, contest, khóa học, chấm điểm |
| **Student** | Sinh viên | Giải bài, tham gia contest, học khóa học, nộp bài |

---

## 📁 Tài liệu chi tiết

| Tài liệu | Mô tả |
|-----------|--------|
| [coderank-api/README.md](./coderank-api/README.md) | Hướng dẫn Backend API |
| [coderank-client/README.md](./coderank-client/README.md) | Hướng dẫn Frontend Client |
| [coderank-agent/README.md](./coderank-agent/README.md) | Hướng dẫn AI Agent |
| [coderank-rag/README.md](./coderank-rag/README.md) | Hướng dẫn RAG Search |
| [AGENTS.md](./AGENTS.md) | Tài liệu handover chi tiết cho developers |
| [VISUAL_REFERENCE.md](./coderank-client/VISUAL_REFERENCE.md) | Hướng dẫn thiết kế giao diện |

---

## 🤝 Đóng góp

1. Tuân theo các pattern và convention đã có trong codebase
2. Viết test cho tính năng mới
3. Cập nhật documentation khi thay đổi
4. Sử dụng conventional commits
5. Đảm bảo lint & format trước khi commit

---

## 📄 License

**UNLICENSED** — Dự án riêng tư.
