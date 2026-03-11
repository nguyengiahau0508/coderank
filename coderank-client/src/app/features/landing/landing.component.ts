import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen" style="background-color: var(--cr-bg-primary);">

      <!-- Navigation -->
      <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style="background: rgba(13, 17, 23, 0.85); border-bottom: 1px solid var(--cr-border);">
        <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, var(--cr-syntax-keyword), var(--cr-syntax-function));">
              <i class="pi pi-code text-white text-sm"></i>
            </div>
            <span class="text-lg font-semibold" style="color: var(--cr-text-primary);">
              Code<span style="color: var(--cr-syntax-function);">Rank</span>
            </span>
          </div>
          <div class="flex items-center gap-6">
            <a href="#features" class="text-sm hidden sm:block" style="color: var(--cr-text-muted);">Features</a>
            <a href="#languages" class="text-sm hidden sm:block" style="color: var(--cr-text-muted);">Languages</a>
            <a href="#comparison" class="text-sm hidden sm:block" style="color: var(--cr-text-muted);">Compare</a>
            <a href="/api-docs" target="_blank" class="text-sm hidden sm:block" style="color: var(--cr-text-muted);">API Docs</a>
            <a routerLink="/login"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style="background: var(--cr-accent-blue); color: var(--cr-bg-primary);">
              Đăng nhập
            </a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-32 pb-20 px-6 overflow-hidden">
        <!-- Background effects -->
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(var(--cr-text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--cr-text-muted) 1px, transparent 1px); background-size: 60px 60px;"></div>
        <div class="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[160px] opacity-10" style="background: var(--cr-syntax-function);"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[160px] opacity-10" style="background: var(--cr-accent-blue);"></div>

        <div class="max-w-4xl mx-auto text-center relative z-10">
          <!-- Version badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 text-xs" style="background: rgba(88, 166, 255, 0.1); border: 1px solid rgba(88, 166, 255, 0.2); color: var(--cr-accent-blue);">
            <span class="w-2 h-2 rounded-full" style="background: var(--cr-accent-green);"></span>
            v2.0 — Hỗ trợ 8 ngôn ngữ lập trình
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6" style="color: var(--cr-text-primary);">
            Luyện tập thuật toán.
            <br />
            <span style="background: linear-gradient(135deg, var(--cr-syntax-keyword), var(--cr-syntax-function), var(--cr-accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Nâng cao kỹ năng.</span>
          </h1>

          <p class="text-lg max-w-2xl mx-auto mb-10" style="color: var(--cr-text-muted);">
            Nền tảng luyện tập lập trình với hệ thống chấm tự động, khóa học có cấu trúc, cuộc thi trực tuyến và trợ lý AI thông minh.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/login"
              class="px-8 py-3 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
              style="background: var(--cr-accent-blue); color: var(--cr-bg-primary); box-shadow: 0 0 20px rgba(88, 166, 255, 0.3);">
              <i class="pi pi-arrow-right text-xs"></i>
              Bắt đầu ngay
            </a>
            <a href="/api-docs" target="_blank"
              class="px-8 py-3 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
              style="border: 1px solid var(--cr-border); color: var(--cr-text-secondary);">
              <i class="pi pi-book text-xs"></i>
              Tài liệu API
            </a>
          </div>
        </div>
      </section>

      <!-- Code Preview Section -->
      <section class="py-16 px-6">
        <div class="max-w-5xl mx-auto">
          <div class="rounded-lg overflow-hidden" style="border: 1px solid var(--cr-border); box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);">
            <!-- Code editor header -->
            <div class="flex items-center justify-between px-4 py-3" style="background: var(--cr-bg-tertiary); border-bottom: 1px solid var(--cr-border);">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" style="background: #f85149;"></div>
                <div class="w-3 h-3 rounded-full" style="background: #d29922;"></div>
                <div class="w-3 h-3 rounded-full" style="background: #3fb950;"></div>
              </div>
              <span class="text-xs" style="color: var(--cr-text-subtle);">solution.py</span>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-xs" style="background: rgba(63, 185, 80, 0.15); color: var(--cr-accent-green);">Accepted</span>
              </div>
            </div>
            <!-- Code content -->
            <div class="p-6 font-mono text-sm leading-7 overflow-x-auto" style="background: var(--cr-bg-secondary);">
              <div><span style="color: var(--cr-syntax-comment);"># Two Sum — O(n) solution</span></div>
              <div><span style="color: var(--cr-syntax-keyword);">def</span> <span style="color: var(--cr-syntax-function);">two_sum</span>(<span style="color: var(--cr-syntax-variable);">nums</span>: <span style="color: var(--cr-syntax-type);">list</span>[<span style="color: var(--cr-syntax-type);">int</span>], <span style="color: var(--cr-syntax-variable);">target</span>: <span style="color: var(--cr-syntax-type);">int</span>) -> <span style="color: var(--cr-syntax-type);">list</span>[<span style="color: var(--cr-syntax-type);">int</span>]:</div>
              <div>    <span style="color: var(--cr-syntax-variable);">seen</span> = {{ '{' }}{{ '}' }}</div>
              <div>    <span style="color: var(--cr-syntax-keyword);">for</span> <span style="color: var(--cr-syntax-variable);">i</span>, <span style="color: var(--cr-syntax-variable);">num</span> <span style="color: var(--cr-syntax-keyword);">in</span> <span style="color: var(--cr-syntax-function);">enumerate</span>(<span style="color: var(--cr-syntax-variable);">nums</span>):</div>
              <div>        <span style="color: var(--cr-syntax-variable);">complement</span> = <span style="color: var(--cr-syntax-variable);">target</span> - <span style="color: var(--cr-syntax-variable);">num</span></div>
              <div>        <span style="color: var(--cr-syntax-keyword);">if</span> <span style="color: var(--cr-syntax-variable);">complement</span> <span style="color: var(--cr-syntax-keyword);">in</span> <span style="color: var(--cr-syntax-variable);">seen</span>:</div>
              <div>            <span style="color: var(--cr-syntax-keyword);">return</span> [<span style="color: var(--cr-syntax-variable);">seen</span>[<span style="color: var(--cr-syntax-variable);">complement</span>], <span style="color: var(--cr-syntax-variable);">i</span>]</div>
              <div>        <span style="color: var(--cr-syntax-variable);">seen</span>[<span style="color: var(--cr-syntax-variable);">num</span>] = <span style="color: var(--cr-syntax-variable);">i</span></div>
              <div>    <span style="color: var(--cr-syntax-keyword);">return</span> []</div>
              <div></div>
              <div><span style="color: var(--cr-syntax-comment);"># Test</span></div>
              <div><span style="color: var(--cr-syntax-function);">print</span>(<span style="color: var(--cr-syntax-function);">two_sum</span>([<span style="color: var(--cr-syntax-number);">2</span>, <span style="color: var(--cr-syntax-number);">7</span>, <span style="color: var(--cr-syntax-number);">11</span>, <span style="color: var(--cr-syntax-number);">15</span>], <span style="color: var(--cr-syntax-number);">9</span>))  <span style="color: var(--cr-syntax-comment);"># [0, 1]</span></div>
            </div>
            <!-- Output bar -->
            <div class="flex items-center gap-3 px-6 py-3" style="background: var(--cr-bg-tertiary); border-top: 1px solid var(--cr-border);">
              <span class="text-xs font-mono" style="color: var(--cr-text-subtle);">Output:</span>
              <span class="text-xs font-mono" style="color: var(--cr-accent-green);">[0, 1]</span>
              <span class="ml-auto text-xs" style="color: var(--cr-text-subtle);">Runtime: 4ms · Memory: 14.2MB</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold mb-4" style="color: var(--cr-text-primary);">
              Tính năng nổi bật
            </h2>
            <p class="text-sm" style="color: var(--cr-text-muted);">Mọi thứ bạn cần để trở thành lập trình viên giỏi hơn</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature 1 -->
            <div class="p-6 rounded-lg transition-all" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style="background: rgba(255, 123, 114, 0.1);">
                <i class="pi pi-code text-lg" style="color: var(--cr-syntax-keyword);"></i>
              </div>
              <h3 class="text-base font-medium mb-2" style="color: var(--cr-text-primary);">Bài tập thuật toán</h3>
              <p class="text-sm leading-relaxed" style="color: var(--cr-text-muted);">Hệ thống bài tập phong phú với 3 cấp độ, chấm điểm tự động và sandbox cách ly an toàn.</p>
            </div>

            <!-- Feature 2 -->
            <div class="p-6 rounded-lg transition-all" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style="background: rgba(210, 168, 255, 0.1);">
                <i class="pi pi-book text-lg" style="color: var(--cr-syntax-function);"></i>
              </div>
              <h3 class="text-base font-medium mb-2" style="color: var(--cr-text-primary);">Khóa học có cấu trúc</h3>
              <p class="text-sm leading-relaxed" style="color: var(--cr-text-muted);">Lộ trình học tập rõ ràng với bài giảng, quiz và bài tập thực hành theo từng chủ đề.</p>
            </div>

            <!-- Feature 3 -->
            <div class="p-6 rounded-lg transition-all" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style="background: rgba(88, 166, 255, 0.1);">
                <i class="pi pi-trophy text-lg" style="color: var(--cr-accent-blue);"></i>
              </div>
              <h3 class="text-base font-medium mb-2" style="color: var(--cr-text-primary);">Cuộc thi lập trình</h3>
              <p class="text-sm leading-relaxed" style="color: var(--cr-text-muted);">Tổ chức và tham gia cuộc thi trực tuyến, so tài với cộng đồng lập trình viên.</p>
            </div>

            <!-- Feature 4 -->
            <div class="p-6 rounded-lg transition-all" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style="background: rgba(63, 185, 80, 0.1);">
                <i class="pi pi-sparkles text-lg" style="color: var(--cr-accent-green);"></i>
              </div>
              <h3 class="text-base font-medium mb-2" style="color: var(--cr-text-primary);">Trợ lý AI</h3>
              <p class="text-sm leading-relaxed" style="color: var(--cr-text-muted);">AI phân tích code, gợi ý lời giải, debug lỗi với hỗ trợ đa mô hình LLM.</p>
            </div>

            <!-- Feature 5 -->
            <div class="p-6 rounded-lg transition-all" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style="background: rgba(255, 166, 87, 0.1);">
                <i class="pi pi-chart-bar text-lg" style="color: var(--cr-syntax-variable);"></i>
              </div>
              <h3 class="text-base font-medium mb-2" style="color: var(--cr-text-primary);">Bảng xếp hạng</h3>
              <p class="text-sm leading-relaxed" style="color: var(--cr-text-muted);">Theo dõi tiến trình, đánh giá rating và so sánh với cộng đồng để tạo động lực.</p>
            </div>

            <!-- Feature 6 -->
            <div class="p-6 rounded-lg transition-all" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style="background: rgba(121, 192, 255, 0.1);">
                <i class="pi pi-shield text-lg" style="color: var(--cr-syntax-type);"></i>
              </div>
              <h3 class="text-base font-medium mb-2" style="color: var(--cr-text-primary);">Bảo mật sandbox</h3>
              <p class="text-sm leading-relaxed" style="color: var(--cr-text-muted);">Code thực thi trong Firejail sandbox với giới hạn thời gian và bộ nhớ nghiêm ngặt.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Languages / Integration Logos Section -->
      <section id="languages" class="py-20 px-6" style="background: var(--cr-bg-secondary);">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold mb-4" style="color: var(--cr-text-primary);">
              Hỗ trợ đa ngôn ngữ
            </h2>
            <p class="text-sm" style="color: var(--cr-text-muted);">Viết code với ngôn ngữ yêu thích của bạn</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            @for (lang of languages; track lang.name) {
              <div class="flex flex-col items-center gap-3 p-6 rounded-lg transition-all cursor-default"
                style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);">
                <span class="text-3xl">{{ lang.icon }}</span>
                <span class="text-sm font-medium" [style.color]="lang.color">{{ lang.name }}</span>
              </div>
            }
          </div>

          <!-- Tech stack logos -->
          <div class="mt-16 text-center">
            <p class="text-xs mb-6" style="color: var(--cr-text-subtle);">ĐƯỢC XÂY DỰNG VỚI</p>
            <div class="flex flex-wrap items-center justify-center gap-8">
              @for (tech of techStack; track tech.name) {
                <div class="flex items-center gap-2 px-3 py-2 rounded" style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border-light);">
                  <span class="text-lg">{{ tech.icon }}</span>
                  <span class="text-xs font-medium" style="color: var(--cr-text-muted);">{{ tech.name }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Comparison Table Section -->
      <section id="comparison" class="py-20 px-6">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold mb-4" style="color: var(--cr-text-primary);">
              So sánh tính năng
            </h2>
            <p class="text-sm" style="color: var(--cr-text-muted);">CodeRank so với các nền tảng phổ biến khác</p>
          </div>

          <div class="rounded-lg overflow-hidden" style="border: 1px solid var(--cr-border);">
            <table class="w-full">
              <thead>
                <tr style="background: var(--cr-bg-tertiary);">
                  <th class="text-left px-6 py-4 text-sm font-medium" style="color: var(--cr-text-primary); border-bottom: 1px solid var(--cr-border);">Tính năng</th>
                  <th class="text-center px-6 py-4 text-sm font-medium" style="color: var(--cr-syntax-function); border-bottom: 1px solid var(--cr-border);">CodeRank</th>
                  <th class="text-center px-6 py-4 text-sm font-medium" style="color: var(--cr-text-muted); border-bottom: 1px solid var(--cr-border);">LeetCode</th>
                  <th class="text-center px-6 py-4 text-sm font-medium" style="color: var(--cr-text-muted); border-bottom: 1px solid var(--cr-border);">HackerRank</th>
                </tr>
              </thead>
              <tbody>
                @for (row of comparisonData; track row.feature) {
                  <tr style="border-bottom: 1px solid var(--cr-border);">
                    <td class="px-6 py-3.5 text-sm" style="color: var(--cr-text-secondary); background: var(--cr-bg-secondary);">{{ row.feature }}</td>
                    <td class="px-6 py-3.5 text-center text-sm" style="background: var(--cr-bg-secondary);">
                      @if (row.coderank === true) {
                        <i class="pi pi-check-circle" style="color: var(--cr-accent-green);"></i>
                      } @else if (row.coderank === false) {
                        <i class="pi pi-times-circle" style="color: var(--cr-text-subtle);"></i>
                      } @else {
                        <span style="color: var(--cr-accent-green);">{{ row.coderank }}</span>
                      }
                    </td>
                    <td class="px-6 py-3.5 text-center text-sm" style="background: var(--cr-bg-secondary);">
                      @if (row.leetcode === true) {
                        <i class="pi pi-check-circle" style="color: var(--cr-text-subtle);"></i>
                      } @else if (row.leetcode === false) {
                        <i class="pi pi-times-circle" style="color: var(--cr-text-subtle);"></i>
                      } @else {
                        <span style="color: var(--cr-text-muted);">{{ row.leetcode }}</span>
                      }
                    </td>
                    <td class="px-6 py-3.5 text-center text-sm" style="background: var(--cr-bg-secondary);">
                      @if (row.hackerrank === true) {
                        <i class="pi pi-check-circle" style="color: var(--cr-text-subtle);"></i>
                      } @else if (row.hackerrank === false) {
                        <i class="pi pi-times-circle" style="color: var(--cr-text-subtle);"></i>
                      } @else {
                        <span style="color: var(--cr-text-muted);">{{ row.hackerrank }}</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 px-6" style="background: var(--cr-bg-secondary);">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-4" style="color: var(--cr-text-primary);">
            Sẵn sàng bắt đầu?
          </h2>
          <p class="text-sm mb-8" style="color: var(--cr-text-muted);">
            Tham gia cộng đồng lập trình viên và bắt đầu luyện tập ngay hôm nay.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/login"
              class="px-8 py-3 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
              style="background: var(--cr-accent-blue); color: var(--cr-bg-primary); box-shadow: 0 0 20px rgba(88, 166, 255, 0.3);">
              <i class="pi pi-sign-in text-xs"></i>
              Đăng nhập ngay
            </a>
            <a href="/api-docs" target="_blank"
              class="px-8 py-3 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
              style="border: 1px solid var(--cr-border); color: var(--cr-text-secondary);">
              <i class="pi pi-external-link text-xs"></i>
              Xem tài liệu
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-8 px-6" style="border-top: 1px solid var(--cr-border);">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded flex items-center justify-center" style="background: linear-gradient(135deg, var(--cr-syntax-keyword), var(--cr-syntax-function));">
              <i class="pi pi-code text-white text-xs"></i>
            </div>
            <span class="text-sm font-medium" style="color: var(--cr-text-muted);">CodeRank</span>
          </div>
          <p class="text-xs" style="color: var(--cr-text-subtle);">© 2026 CodeRank. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    a[href^="#"] {
      scroll-behavior: smooth;
    }

    a:hover {
      opacity: 0.85;
    }
  `]
})
export class LandingComponent {
  readonly languages = [
    { name: 'Python', icon: '🐍', color: 'var(--cr-syntax-variable)' },
    { name: 'JavaScript', icon: '⚡', color: 'var(--cr-accent-yellow)' },
    { name: 'TypeScript', icon: '🔷', color: 'var(--cr-accent-blue)' },
    { name: 'Java', icon: '☕', color: 'var(--cr-syntax-keyword)' },
    { name: 'C++', icon: '⚙️', color: 'var(--cr-syntax-type)' },
    { name: 'C', icon: '🔧', color: 'var(--cr-text-muted)' },
    { name: 'Go', icon: '🐹', color: 'var(--cr-accent-cyan)' },
    { name: 'Rust', icon: '🦀', color: 'var(--cr-syntax-variable)' },
  ];

  readonly techStack = [
    { name: 'Angular', icon: '🅰️' },
    { name: 'NestJS', icon: '🐈' },
    { name: 'MariaDB', icon: '🐬' },
    { name: 'Monaco', icon: '📝' },
    { name: 'PrimeNG', icon: '🎨' },
    { name: 'Gemini AI', icon: '✨' },
  ];

  readonly comparisonData = [
    { feature: 'Bài tập thuật toán', coderank: true, leetcode: true, hackerrank: true },
    { feature: 'Khóa học có cấu trúc', coderank: true, leetcode: false, hackerrank: true },
    { feature: 'Cuộc thi trực tuyến', coderank: true, leetcode: true, hackerrank: true },
    { feature: 'Trợ lý AI tích hợp', coderank: true, leetcode: false, hackerrank: false },
    { feature: 'Self-hosted', coderank: true, leetcode: false, hackerrank: false },
    { feature: 'Mã nguồn mở', coderank: true, leetcode: false, hackerrank: false },
    { feature: 'Sandbox cách ly', coderank: 'Firejail', leetcode: 'Docker', hackerrank: 'Docker' },
    { feature: 'Ngôn ngữ hỗ trợ', coderank: '8', leetcode: '20+', hackerrank: '35+' },
    { feature: 'Quản lý lớp học', coderank: true, leetcode: false, hackerrank: true },
    { feature: 'API Documentation', coderank: 'Swagger', leetcode: false, hackerrank: false },
  ];
}
