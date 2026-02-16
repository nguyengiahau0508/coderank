# 📸 Visual Design Reference - Minimalist Auth

## Login Page - Full Layout

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                                                                   ║
║                        ┌─────────────┐                           ║
║                        │             │                           ║
║                        │  CodeRank   │    4xl font-light         ║
║                        │             │    slate-900              ║
║                        └─────────────┘    tracking-tight         ║
║                                                                   ║
║                   Nền tảng đánh giá kỹ năng lập trình           ║
║                        (sm, slate-500, font-light)               ║
║                                                                   ║
║                                                                   ║
║                                                                   ║
║            ╔═════════════════════════════════════╗               ║
║            ║                                     ║               ║
║            ║                                     ║               ║
║            ║          Đăng nhập                 ║               ║
║            ║       (2xl font-light)              ║               ║
║            ║                                     ║               ║
║            ║                                     ║               ║
║            ║  ┌──────────────────────────────┐  ║               ║
║            ║  │                              │  ║               ║
║            ║  │  🔵  Tiếp tục với Google    │  ║               ║
║            ║  │                              │  ║  border-300   ║
║            ║  │  (sm font-normal slate-700)  │  ║  hover:400    ║
║            ║  │                              │  ║  rounded-xl   ║
║            ║  └──────────────────────────────┘  ║  px-6 py-4    ║
║            ║                                     ║               ║
║            ║                                     ║               ║
║            ║  ─────────── HOẶC ───────────      ║               ║
║            ║  (xs, slate-400, font-light)       ║               ║
║            ║                                     ║               ║
║            ║                                     ║               ║
║            ║  ┌──────────────────────────────┐  ║               ║
║            ║  │                              │  ║               ║
║            ║  │  🐙  Tiếp tục với GitHub    │  ║  bg-slate-900 ║
║            ║  │                              │  ║  text-white   ║
║            ║  │  (sm font-normal white)      │  ║  hover:800    ║
║            ║  │                              │  ║  rounded-xl   ║
║            ║  └──────────────────────────────┘  ║  px-6 py-4    ║
║            ║                                     ║               ║
║            ║                                     ║               ║
║            ╚═════════════════════════════════════╝               ║
║                    (bg-white, rounded-2xl)                       ║
║                    (shadow-sm, border-200/60)                    ║
║                    (p-12 = 48px padding)                         ║
║                                                                   ║
║                                                                   ║
║      Bằng cách đăng nhập, bạn đồng ý với các điều khoản...      ║
║                  (xs, slate-400, font-light)                     ║
║                                                                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
         (bg-gradient-to-br from-slate-50 to-slate-100)
                      (min-h-screen)
```

## Spacing Breakdown

```
Vertical Spacing:
─────────────────
       64px (mb-16)    ← Logo to Card
         ↓
    ┌─────────┐
    │  Card   │
    │         │
    │  48px   │        ← Card internal padding (p-12)
    │         │
    │  48px   │        ← Between title and buttons (mb-12)
    │         │
    │  24px   │        ← Between buttons (space-y-6)
    │         │
    │  32px   │        ← Divider margins (my-8)
    │         │
    └─────────┘
         ↓
       48px (mt-12)    ← Card to disclaimer


Horizontal Spacing:
──────────────────
    32px    Content    32px
    (px-8)           (px-8)
    
    Page margins: 24px (px-6)
```

## Color Reference

```
┌──────────────────────────────────────────────┐
│  Background Colors                           │
├──────────────────────────────────────────────┤
│  slate-50   #f8fafc  ████████                │
│  slate-100  #f1f5f9  ████████                │
│  white      #ffffff  ████████                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Text Colors                                 │
├──────────────────────────────────────────────┤
│  slate-900  #0f172a  ████████  (Headings)    │
│  slate-700  #334155  ████████  (Buttons)     │
│  slate-500  #64748b  ████████  (Body)        │
│  slate-400  #94a3b8  ████████  (Muted)       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Border Colors                               │
├──────────────────────────────────────────────┤
│  slate-200  #e2e8f0  ████████  (Dividers)    │
│  slate-300  #cbd5e1  ████████  (Default)     │
│  slate-400  #94a3b8  ████████  (Hover)       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Brand Colors (Google)                       │
├──────────────────────────────────────────────┤
│  Blue    #4285F4  ████████                   │
│  Red     #EA4335  ████████                   │
│  Yellow  #FBBC05  ████████                   │
│  Green   #34A853  ████████                   │
└──────────────────────────────────────────────┘
```

## Button States Animation

```
Google Button:
─────────────

Default:
┌────────────────────────┐
│ bg-white               │
│ border-slate-300       │
│ text-slate-700         │
└────────────────────────┘

    ↓ Hover (200ms ease-out)

┌────────────────────────┐
│ bg-slate-50            │
│ border-slate-400       │
│ text-slate-700         │
└────────────────────────┘

    ↓ Focus

┌────────────────────────┐
│ bg-slate-50            │
│ border-slate-400       │
│ ring-2 ring-slate-400  │ ← Focus ring
│ ring-offset-2          │
└────────────────────────┘


GitHub Button:
─────────────

Default:
┌────────────────────────┐
│ bg-slate-900           │
│ border-slate-900       │
│ text-white             │
└────────────────────────┘

    ↓ Hover (200ms ease-out)

┌────────────────────────┐
│ bg-slate-800           │
│ border-slate-800       │
│ text-white             │
└────────────────────────┘

    ↓ Focus

┌────────────────────────┐
│ bg-slate-800           │
│ border-slate-800       │
│ ring-2 ring-slate-500  │ ← Focus ring
│ ring-offset-2          │
└────────────────────────┘
```

## Typography Scale

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                        ┃
┃  CodeRank                              ┃  4xl (36px) font-light
┃                                        ┃  tracking-tight
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────────────────────────────┐
│  Đăng nhập                             │  2xl (24px) font-light
└────────────────────────────────────────┘

Tiếp tục với Google                        sm (14px) font-normal

Nền tảng đánh giá kỹ năng lập trình       sm (14px) font-light

HOẶC                                       xs (12px) font-light

Bằng cách đăng nhập...                     xs (12px) font-light
```

## Responsive Breakpoints

```
Mobile (<640px):
┌─────────────┐
│   px-6      │
│             │
│  max-w-md   │
│   (28rem)   │
│             │
│   px-6      │
└─────────────┘

Tablet (640px+):
┌────────────────────┐
│      px-6          │
│                    │
│    max-w-md        │
│     (28rem)        │
│                    │
│      px-6          │
└────────────────────┘

Desktop (1024px+):
┌──────────────────────────┐
│         px-6             │
│                          │
│       max-w-md           │
│        (28rem)           │
│                          │
│         px-6             │
└──────────────────────────┘
```

## Icon Sizing

```
OAuth Provider Icons:
┌─────┐
│     │  20x20px (w-5 h-5)
│  🔵 │  Inline SVG
│     │  fill: brand colors
└─────┘

Loading Spinner:
┌─────────┐
│         │  Container: 64x64px (w-16 h-16)
│    ◐    │  Spinner: 32x32px (w-8 h-8)
│         │  Border: 3px (border-3)
└─────────┘

Avatar:
┌─────┐
│     │  36x36px (w-9 h-9)
│  👤 │  rounded-full
│     │  border-slate-200
└─────┘
```

## Shadow & Elevation

```
Card Elevation:
┌────────────────┐
│                │  shadow-sm
│    Content     │  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)
│                │
└────────────────┘

Focus Ring:
┌────────────────┐
│                │  ring-2
│    Button      │  ring-slate-400
│                │  ring-offset-2
└────────────────┘
  ││││││││││││││    (2px offset + 2px ring)
```

## Loading States

```
Callback Page:
═══════════════════════════════════════

            ┌─────────┐
            │         │
            │    ◐    │  ← Spinning (animate-spin)
            │         │     border-t-slate-900
            └─────────┘     border-slate-300
            
       Đang xác thực...    ← Status message
       
═══════════════════════════════════════
```

## Accessibility

```
Focus Indicators:
─────────────────
[Button]            ← No focus
  ↓ Tab
[Button]            ← focus:outline-none
  ││││││              focus:ring-2 ring-slate-400
  ││││││              (Visible 2px ring)


Color Contrast:
──────────────
Background: #f8fafc (slate-50)
Text:       #0f172a (slate-900)
Ratio:      15.8:1 ✅ (WCAG AAA)

Background: #ffffff (white)
Text:       #64748b (slate-500)
Ratio:      4.7:1 ✅ (WCAG AA)
```

## Grid System

```
Page Layout:
┌───────────────────────────────────────┐
│ min-h-screen                          │
│ flex items-center justify-center      │
│                                       │
│     ┌──────────────────────┐         │
│     │ w-full max-w-md      │         │
│     │ px-8                 │         │
│     │                      │         │
│     │   [Content]          │         │
│     │                      │         │
│     └──────────────────────┘         │
│                                       │
└───────────────────────────────────────┘
```

---

**Design Completed**: 2026-02-15  
**Style Guide**: Minimalist Web Design  
**Framework**: Angular 21 + TailwindCSS 4  
**Total Colors Used**: 6 shades of gray + brand accents  
**Total Font Weights**: 2 (300, 400)  
**Animation Count**: 1 (spinner rotation)  
