# Database Seeding

Hệ thống seed data đầy đủ cho tất cả các bảng trong CodeRank API.

## Cấu trúc

```
src/db/seeds/
├── seed.ts                 # File chính để chạy tất cả seeders
├── data-source.ts          # Cấu hình kết nối database
├── users.seeder.ts         # Seed users, auth providers, sessions
├── problems.seeder.ts      # Seed problems, tags, testcases, hints, solutions, submissions
├── courses.seeder.ts       # Seed courses, sections, lessons, enrollments, quizzes, assignments
├── contests.seeder.ts      # Seed contests, participants, problems, submissions
└── ai-features.seeder.ts   # Seed conversations, code reviews, AI hints, gradings, etc.
```

## Dữ liệu được tạo

### Users & Auth (users.seeder.ts)
- **1 Admin**: username `admin`, email `admin@coderank.com`
- **5 Instructors**: username `instructor1-5`, có quyền tạo bài tập và khóa học
- **50 Students**: username `student1-50`, học viên thông thường
- **Auth Providers**: Mỗi user có 1 auth provider (Local)
- **Sessions**: 20 active sessions ngẫu nhiên

### Problems (problems.seeder.ts)
- **30 Problems**: Các bài tập thuật toán phổ biến (Two Sum, Reverse String, etc.)
- **20 Tags**: Array, String, Hash Table, Dynamic Programming, etc.
- **3-8 Testcases** cho mỗi problem (có sample và hidden)
- **1-3 Hints** cho mỗi problem
- **1-3 Solutions** cho mỗi problem (nhiều ngôn ngữ)
- **5-20 Submissions** cho mỗi problem từ students

### Courses (courses.seeder.ts)
- **10 Courses**: Các khóa học về lập trình, web, data science, etc.
- **3-6 Sections** cho mỗi course
- **3-8 Lessons** cho mỗi section (Video, Text, Quiz, Practice)
- **10-30 Enrollments** cho mỗi course
- **Quizzes**: Với 5-15 câu hỏi mỗi quiz
- **Assignments**: Cho các bài practice
- **Reviews**: 5-15 reviews cho mỗi course

### Contests (contests.seeder.ts)
- **10 Contests**: Weekly contests, championships, challenges
- **3-6 Problems** cho mỗi contest
- **10-40 Participants** cho mỗi contest
- **Submissions**: Nhiều submissions từ participants
- **Leaderboard**: Tự động tính điểm và xếp hạng

### AI Features (ai-features.seeder.ts)
- **Conversations**: 1-5 conversations cho 20 students
- **Messages**: 2-10 messages cho mỗi conversation
- **AI Configs**: Cấu hình AI cho tất cả users
- **Code Reviews**: 50 code reviews với findings và suggestions
- **AI Hints**: 1-3 hints cho 30 problems
- **AI Gradings**: 40 gradings với feedback chi tiết
- **AI Testcases**: 2-5 testcases được AI tạo cho 20 problems
- **Plagiarism Reports**: 20 reports so sánh submissions
- **Skill Profiles**: Profile kỹ năng cho tất cả students
- **Learning Paths**: Lộ trình học tập cho 30 students
- **Class Analytics**: Analytics cho instructors

## Cách sử dụng

### 1. Cấu hình Database

Đảm bảo file `.env` có các biến sau:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=coderank
```

### 2. Chạy Seed

```bash
# Từ thư mục gốc của project
npm run seed
```

Hoặc:

```bash
# Chạy trực tiếp
ts-node -r tsconfig-paths/register -r dotenv/config src/db/seeds/seed.ts
```

### 3. Kết quả

Script sẽ:
1. Kết nối database
2. **Xóa toàn bộ dữ liệu cũ** (TRUNCATE tất cả bảng)
3. Tạo dữ liệu mới theo thứ tự:
   - Users & Auth
   - Problems & Tags
   - Courses
   - Contests
   - AI Features
4. Hiển thị summary và đóng kết nối

## Lưu ý quan trọng

⚠️ **CẢNH BÁO**: Script sẽ **XÓA TOÀN BỘ DỮ LIỆU** trong database trước khi seed!

Nếu bạn muốn giữ dữ liệu cũ, comment đoạn code sau trong `seed.ts`:

```typescript
// Comment từ dòng này
console.log('🗑️  Clearing existing data...');
// ... đến dòng này
console.log('✅ Existing data cleared\n');
```

## Tài khoản test

Sau khi seed, bạn có thể đăng nhập với:

**Admin:**
- Username: `admin`
- Email: `admin@coderank.com`

**Instructor:**
- Username: `instructor1` đến `instructor5`
- Email: `instructor1@coderank.com` đến `instructor5@coderank.com`

**Student:**
- Username: `student1` đến `student50`
- Email: `student1@coderank.com` đến `student50@coderank.com`

## Tùy chỉnh

Bạn có thể tùy chỉnh số lượng dữ liệu trong mỗi seeder:

- `users.seeder.ts`: Thay đổi số lượng instructors (5) và students (50)
- `problems.seeder.ts`: Thêm/bớt problems trong mảng `problemTitles`
- `courses.seeder.ts`: Thêm/bớt courses trong mảng `courseTitles`
- `contests.seeder.ts`: Thêm/bớt contests trong mảng `contestTitles`

## Troubleshooting

### Lỗi kết nối database
```
Error: connect ECONNREFUSED
```
→ Kiểm tra MySQL đang chạy và thông tin kết nối trong `.env`

### Lỗi foreign key
```
Error: Cannot add or update a child row
```
→ Đảm bảo chạy seeders theo đúng thứ tự (users → problems → courses → contests → ai-features)

### Lỗi duplicate entry
```
Error: Duplicate entry 'xxx' for key 'yyy'
```
→ Chạy lại script, nó sẽ TRUNCATE tất cả bảng trước khi seed
