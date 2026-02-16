# Minimalist Auth UI - CodeRank

Thiết kế chức năng authentication với phong cách **Minimalist** (tối giản).

## 🎨 Design Philosophy - Minimalist Web Design

### Nguyên tắc thiết kế:
1. **Simplicity First** - Tập trung vào sự đơn giản
2. **Generous Whitespace** - Sử dụng nhiều không gian trắng
3. **Clear Typography** - Font chữ rõ ràng, dễ đọc
4. **Remove Unnecessary Elements** - Loại bỏ các yếu tố không cần thiết
5. **Content-First** - Làm nổi bật nội dung chính

## 📂 Structure

```
src/app/
├── core/
│   ├── services/
│   │   └── auth.service.ts          # Auth state management with signals
│   ├── guards/
│   │   └── auth.guard.ts             # Route protection guards
│   └── interceptors/
│       ├── auth.interceptor.ts       # Attach JWT token
│       └── error.interceptor.ts      # Handle 401 errors
└── features/
    └── auth/
        └── pages/
            ├── login/
            │   └── login.component.ts    # Minimalist login page
            └── callback/
                └── callback.component.ts  # OAuth callback handler
```

## 🚀 Features Implemented

### 1. **Login Page** (`/login`)
**Minimalist Design Elements:**
- ✨ **Generous Spacing**: `mb-16`, `mb-12`, `py-16` cho không gian thoáng
- 🎨 **Subtle Colors**: Gradient `slate-50` → `slate-100` background
- 📝 **Light Typography**: `font-light` cho cảm giác nhẹ nhàng
- 🔘 **Two OAuth Buttons**: Chỉ Google & GitHub (không form phức tạp)
- 🎯 **Centered Layout**: Căn giữa với `max-w-md` container
- ⚪ **Clean Card**: `rounded-2xl` với `shadow-sm` nhẹ
- 🔤 **Clear Branding**: Logo "CodeRank" với `text-4xl font-light`

**Color Palette:**
```css
Background:  bg-gradient-to-br from-slate-50 to-slate-100
Card:        bg-white with border-slate-200/60
Text:        text-slate-900 (headings), text-slate-500 (body)
Accent:      Google colors, slate-900 for GitHub
```

**Typography:**
```css
Heading:  text-4xl font-light tracking-tight
Body:     text-sm font-light
Buttons:  text-sm font-normal
```

### 2. **Callback Page** (`/auth/callback`)
**Minimalist Loading State:**
- 🔄 Simple spinning loader (pure CSS)
- 📱 Centered content với minimal feedback
- ✅ Success/Error messages (concise)

### 3. **Dashboard** (`/dashboard`)
**Clean Header:**
- 🎯 Logo + User info + Logout button
- 📐 Simple layout với `max-w-7xl` container
- 👤 Avatar circle với `rounded-full`
- 🔤 Typography hierarchy rõ ràng

### 4. **Auth Service** (Angular Signals)
```typescript
// Modern Angular approach
readonly currentUser = signal<User | null>(null);
readonly isAuthenticated = computed(() => !!currentUser());
```

### 5. **Route Guards**
- `authGuard`: Bảo vệ routes yêu cầu đăng nhập
- `guestGuard`: Redirect nếu đã đăng nhập

## 🎭 Design Tokens

### Spacing Scale (Minimalist)
```css
Small:   gap-3, gap-4    /* Elements spacing */
Medium:  mb-12, py-12    /* Section spacing */
Large:   mb-16, py-16    /* Page-level spacing */
```

### Border Radius
```css
Cards:   rounded-2xl     /* 1rem - soft corners */
Buttons: rounded-xl      /* 0.75rem */
Avatar:  rounded-full    /* Circles */
```

### Shadows (Subtle)
```css
shadow-sm    /* Minimal shadow for cards */
```

### Transitions
```css
transition-all duration-200 ease-out  /* Smooth but quick */
```

## 🔐 Authentication Flow

```
1. User visits protected route
   ↓
2. authGuard redirects to /login
   ↓
3. User clicks "Google" or "GitHub"
   ↓
4. Redirects to backend OAuth endpoint
   ↓
5. Backend handles OAuth with provider
   ↓
6. Redirects to /auth/callback with token
   ↓
7. Callback extracts token & user data
   ↓
8. Saves to localStorage & authService
   ↓
9. Redirects to dashboard (or returnUrl)
```

## 📱 Responsive Design

**Mobile-First Approach:**
```css
px-6   /* Horizontal padding */
px-8   /* On login card */
max-w-md  /* Constrain width on desktop */
```

## 🎨 Component Examples

### Login Button Pattern
```typescript
<button
  class="w-full flex items-center justify-center gap-4 
         px-6 py-4 
         bg-white border border-slate-300 rounded-xl
         text-slate-700 font-normal text-sm
         hover:bg-slate-50 hover:border-slate-400 
         transition-all duration-200 ease-out
         focus:outline-none focus:ring-2 focus:ring-slate-400"
>
  <svg>...</svg>
  <span>Button Text</span>
</button>
```

### Divider Pattern
```typescript
<div class="relative my-8">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-slate-200"></div>
  </div>
  <div class="relative flex justify-center text-xs">
    <span class="bg-white px-4 text-slate-400 font-light">TEXT</span>
  </div>
</div>
```

## 🧪 Testing

```bash
# Build project
cd coderank-client
npm run build

# Start dev server
npm start

# Visit http://localhost:4200/login
```

## 🔧 Backend Integration

**Required Backend Endpoints:**
- `GET  /auth/google` - OAuth redirect
- `GET  /auth/github` - OAuth redirect
- `GET  /auth/google/callback` - OAuth callback (redirects to frontend)
- `GET  /auth/github/callback` - OAuth callback (redirects to frontend)
- `POST /auth/refresh-tokens` - Refresh access token
- `GET  /auth/logout` - Logout & revoke tokens

**Expected Callback URL Format:**
```
http://localhost:4200/auth/callback?accessToken=xxx&user={"id":"..."}
```

## 🎯 Key Achievements

✅ **Ultra-clean UI** - Zero clutter, focus on action  
✅ **Modern Angular** - Signals, standalone components, control flow  
✅ **TailwindCSS 4** - Utility-first styling  
✅ **Accessibility** - Focus states, semantic HTML  
✅ **Performance** - Lazy-loaded routes, small bundles  
✅ **Type-safe** - Full TypeScript coverage  

## 📖 Usage

### For Users
1. Navigate to `/login`
2. Click "Tiếp tục với Google" hoặc "Tiếp tục với GitHub"
3. Authorize app on provider's page
4. Automatically redirected to dashboard

### For Developers
```typescript
// Inject auth service
private readonly authService = inject(AuthService);

// Check auth status
if (this.authService.isAuthenticated()) {
  // User is logged in
}

// Get current user (signal)
const user = this.authService.currentUser();

// Logout
this.authService.logout();
```

## 🌟 Minimalist Highlights

1. **No unnecessary animations** - Only subtle transitions
2. **No heavy graphics** - Simple SVG icons
3. **No complex forms** - Just OAuth buttons
4. **No distractions** - Focus on primary action
5. **No excessive colors** - Monochromatic with brand accents
6. **Clear hierarchy** - Typography does the work

---

**Design Status:** ✅ Complete  
**Build Status:** ✅ Passing  
**Style Guide:** Minimalist Web Design  
**Framework:** Angular 21 + TailwindCSS 4
