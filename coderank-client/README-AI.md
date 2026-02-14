# CodeRank Client - AI Context

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Architecture Overview

This is an **Angular 21 application** using standalone components.

### Key Technologies
- **Angular 21**: Latest features with standalone components
- **PrimeNG**: UI component library
- **TailwindCSS 4**: Utility-first CSS
- **RxJS**: Reactive programming
- **Angular Signals**: State management

## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices
- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Project Structure
```
src/
├── app/
│   ├── core/          # Singleton services, guards, interceptors
│   ├── shared/        # Shared components, pipes, directives
│   ├── features/      # Feature modules/components
│   │   └── {feature}/
│   │       ├── components/
│   │       ├── services/
│   │       └── models/
│   ├── app.routes.ts  # Application routes
│   └── app.config.ts  # Application configuration
├── assets/            # Static assets
└── styles.css         # Global styles
```

### Important Patterns

#### Components (Standalone)
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-example',
  imports: [ButtonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'handleClick()',
    '[class.active]': 'isActive()'
  }
})
export class ExampleComponent {
  // Use input() function
  readonly title = input.required<string>();
  readonly count = input<number>(0);
  
  // Use output() function
  readonly countChange = output<number>();
  
  // Use computed() for derived state
  readonly displayText = computed(() => `${this.title()}: ${this.count()}`);
  
  handleClick() {
    this.countChange.emit(this.count() + 1);
  }
  
  isActive() {
    return this.count() > 0;
  }
}
```

#### Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- Use HttpClient for API calls
- Handle errors with proper error handling
- Use signals or observables for state

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private data = signal<Data[]>([]);
  
  readonly data$ = this.data.asReadonly();
  
  loadData() {
    return this.http.get<Data[]>('/api/data');
  }
}
```

#### Routing
- Define in `app.routes.ts`
- Use lazy loading for features: `loadComponent: () => import(...)`
- Implement guards for protected routes

#### Forms
- Prefer Reactive Forms with FormBuilder
- Use FormGroup and FormControl with proper typing
- Add validators (built-in and custom)
- Handle submission and errors properly

#### State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Use services with signals for shared state
- Minimize use of observables where signals work better
- Subscribe in template with async pipe for observables

```typescript
// Good: Use update or set
count = signal(0);
increment() {
  this.count.update(n => n + 1);
  // or
  this.count.set(this.count() + 1);
}

// Bad: Don't use mutate
// count.mutate(n => n++);
```

### UI Components (PrimeNG)

PrimeNG is the Most Complete Angular UI Component Library with WCAG 2.1 AA level compliance.

#### Key Resources
- [Installation](https://primeng.org/installation): Setting up PrimeNG in Angular
- [Configuration](https://primeng.org/configuration): Application wide configuration
- [Styled Mode](https://primeng.org/theming/styled): Pre-styled themes
- [Unstyled Mode](https://primeng.org/theming/unstyled): Custom styling approaches
- [Tailwind CSS Integration](https://primeng.org/tailwind): PrimeNG + Tailwind
- [Accessibility](https://primeng.org/guides/accessibility): WCAG compliance
- [Pass Through](https://primeng.org/passthrough): Direct element access for customization

#### Import Pattern
Always import PrimeNG components in standalone components:
```typescript
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-example',
  imports: [ButtonModule, InputTextModule, TableModule],
  // ...
})
```

#### Common Components
- **Forms**: `p-inputtext`, `p-textarea`, `p-select`, `p-multiselect`, `p-checkbox`, `p-radiobutton`, `p-toggleswitch`, `p-datepicker`, `p-password`, `p-inputnumber`, `p-inputmask`, `p-autocomplete`, `p-cascadeselect`, `p-treeselect`
- **Buttons**: `p-button`, `p-splitbutton`, `p-speeddial`, `p-togglebutton`
- **Data**: `p-table`, `p-dataview`, `p-tree`, `p-treetable`, `p-timeline`, `p-organizationchart`, `p-paginator`, `p-scroller`
- **Panels**: `p-card`, `p-panel`, `p-fieldset`, `p-accordion`, `p-tabs`, `p-drawer`, `p-dialog`, `p-popover`, `p-confirmdialog`, `p-confirmpopup`
- **Overlay**: `p-dialog`, `p-drawer`, `p-popover`, `p-contextmenu`, `p-tooltip`
- **Messages**: `p-toast`, `p-message`
- **Navigation**: `p-menu`, `p-menubar`, `p-panelmenu`, `p-tieredmenu`, `p-megamenu`, `p-breadcrumb`, `p-stepper`
- **Media**: `p-galleria`, `p-carousel`, `p-imagecompare`
- **Charts**: `p-chart` (based on Chart.js 3.3.2+)
- **Misc**: `p-avatar`, `p-badge`, `p-tag`, `p-chip`, `p-progressbar`, `p-progressspinner`, `p-skeleton`, `p-rating`, `p-knob`, `p-metergroup`

#### PrimeNG with Signals
PrimeNG components work seamlessly with Angular signals:
```typescript
readonly items = signal<Item[]>([]);
readonly selectedItem = signal<Item | null>(null);

// In template
<p-table [value]="items()">
<p-select [(ngModel)]="selectedItem" [options]="items()">
```

#### Styling with TailwindCSS
PrimeNG integrates well with TailwindCSS. Use Pass Through props for deep customization:
```typescript
<p-button 
  label="Submit"
  [pt]="{
    root: { class: 'bg-primary hover:bg-primary-600' }
  }"
/>
```

### Styling (TailwindCSS)

- Use utility classes: `flex`, `grid`, `p-4`, `text-center`, etc.
- Combine with PrimeNG styling
- Use `@apply` for component-specific styles if needed
- Follow mobile-first approach: `md:`, `lg:` prefixes

### API Integration

- Use HttpClient in services
- Define models/interfaces for API responses
- Handle loading states
- Handle errors with user feedback (toast/notifications)
- Use environment variables for API URLs

### Common Angular Patterns

#### Signals (Preferred for new code)
```typescript
count = signal(0);
doubleCount = computed(() => this.count() * 2);
effect(() => console.log('Count:', this.count()));
```

#### Dependency Injection
Use `inject()` function instead of constructor injection:
```typescript
import { inject } from '@angular/core';

export class MyComponent {
  private myService = inject(MyService);
  private router = inject(Router);
  private http = inject(HttpClient);
}
```

#### Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available
- Do not write arrow functions in templates (they are not supported)

```html
<!-- Good: Use new control flow -->
@if (isLoggedIn()) {
  <p>Welcome back!</p>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

@switch (status()) {
  @case ('loading') {
    <p>Loading...</p>
  }
  @case ('error') {
    <p>Error occurred</p>
  }
  @default {
    <p>Ready</p>
  }
}

<!-- Good: Use class bindings -->
<div [class.active]="isActive()" [class.disabled]="isDisabled()">

<!-- Good: Use style bindings -->
<div [style.width.px]="width()" [style.color]="color()">

<!-- Bad: Don't use ngClass/ngStyle -->
<!-- <div [ngClass]="{'active': isActive()}"> -->
<!-- <div [ngStyle]="{'width': width() + 'px'}"> -->
```

## When Generating Code

1. **Components**: 
   - Use standalone (DON'T set `standalone: true`, it's default)
   - Use `input()` and `output()` functions
   - Set `changeDetection: ChangeDetectionStrategy.OnPush`
   - Use `inject()` for dependencies
   - Import required PrimeNG modules

2. **Services**: 
   - Use `inject()` function for dependencies
   - Use `providedIn: 'root'`
   - Use signals for state
   - Use proper types

3. **Templates**:
   - Use new control flow (`@if`, `@for`, `@switch`)
   - Use class/style bindings instead of ngClass/ngStyle
   - Don't use arrow functions
   - Don't assume globals exist

4. **State Management**:
   - Use signals with `signal()`, `computed()`, `effect()`
   - Use `set()` or `update()`, never `mutate()`
   - Keep transformations pure

5. **Forms**: 
   - Prefer Reactive forms
   - Use proper validation

6. **Routing**: 
   - Implement lazy loading

7. **Styling**: 
   - Use TailwindCSS + PrimeNG consistently
   - Use PrimeNG Pass Through for customization

8. **Accessibility**:
   - MUST pass AXE checks
   - MUST follow WCAG AA minimums
   - Proper focus management, color contrast, ARIA attributes

9. **Types**: 
   - Use strict type checking
   - Avoid `any`, use `unknown` if needed
   - Define interfaces for all data structures

10. **Error Handling**: 
    - Show user-friendly messages with PrimeNG Toast

## Common Tasks

### Create New Component
```bash
ng generate component features/{feature}/{component-name} --standalone
```

### Create New Service
```bash
ng generate service core/services/{service-name}
```

### Add API Service
1. Define interface for response
2. Create service with HttpClient
3. Implement methods for endpoints
4. Handle errors and loading states
5. Use in components

### Add PrimeNG Component
1. Import the module in component
2. Add to template
3. Configure properties
4. Handle events
5. Style with TailwindCSS

### Implement Form
1. Import ReactiveFormsModule
2. Use FormBuilder to create form
3. Add validators
4. Bind to template
5. Handle submission
6. Show validation errors
