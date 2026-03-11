import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2-alternative';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import CodeRankPreset from './app.preset';
import { authInterceptor, errorInterceptor, loadingInterceptor } from './core/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loadingInterceptor,
        errorInterceptor
      ])
    ),
    providePrimeNG({
      theme: {
        preset: CodeRankPreset,
        options: {
          darkModeSelector: '.dark'
        }
      }
    }),
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useValue: {
        baseUrl: './assets/monaco/min/vs',
        defaultOptions: {
          scrollBeyondLastLine: false,
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
        },
        onMonacoLoad: () => {
          console.log('Monaco Editor loaded successfully');
        }
      }
    }
  ]
};
