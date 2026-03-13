import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
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
