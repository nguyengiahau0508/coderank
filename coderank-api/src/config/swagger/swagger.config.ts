import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Swagger API Documentation Configuration
 * 
 * This configuration provides a comprehensive setup for the CodeRank API documentation.
 * It includes authentication schemes, API metadata, and server information.
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('CodeRank API')
  .setDescription(`
## 🚀 CodeRank API Documentation

CodeRank là một nền tảng học lập trình và thi đấu trực tuyến.

### Các tính năng chính:
- **Authentication**: Đăng nhập qua Google, GitHub hoặc tài khoản local
- **User Management**: Quản lý người dùng và hồ sơ
- **Code Runner**: Chạy và đánh giá code
- **Contests**: Thi đấu lập trình trực tuyến
- **Learning**: Hệ thống học tập với các bài toán và khóa học

### Authentication
API sử dụng JWT Bearer Token để xác thực. Để sử dụng các endpoint được bảo vệ:
1. Đăng nhập qua OAuth (Google/GitHub) hoặc Local
2. Sử dụng access token nhận được trong header Authorization

### Rate Limiting
- Mặc định: 100 requests/phút
- Authentication endpoints: 10 requests/phút

### Response Format
Tất cả responses đều tuân theo format:
\`\`\`json
{
  "statusCode": 200,
  "message": "Success",
  "data": {}
}
\`\`\`
  `)
  .setVersion('1.0.0')
  .setContact(
    'CodeRank Team',
    'https://coderank.vn',
    'support@coderank.vn'
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:3000', 'Development Server')
  .addServer('https://api.coderank.vn', 'Production Server')
  // JWT Bearer Authentication
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter your JWT access token',
      in: 'header',
    },
    'JWT-auth', // Security name reference
  )
  // OAuth2 Google Authentication
  .addOAuth2(
    {
      type: 'oauth2',
      description: 'Google OAuth2 Authentication',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: {
            'email': 'Access email address',
            'profile': 'Access profile information',
          },
        },
      },
    },
    'Google-OAuth2', // Security name reference
  )
  // OAuth2 GitHub Authentication
  .addOAuth2(
    {
      type: 'oauth2',
      description: 'GitHub OAuth2 Authentication',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          scopes: {
            'user:email': 'Access user email',
            'read:user': 'Read user profile',
          },
        },
      },
    },
    'GitHub-OAuth2', // Security name reference
  )
  // API Key (Optional - for future use)
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-KEY',
      in: 'header',
      description: 'API Key for external integrations',
    },
    'API-Key',
  )
  // Global tags for API grouping
  .addTag('Health', 'API health check endpoints')
  .addTag('Authentication', 'User authentication and authorization')
  .addTag('Users', 'User management operations')
  .addTag('Code Runner', 'Code execution and evaluation')
  .addTag('Problems', 'Problem management')
  .addTag('Submissions', 'Code submission handling')
  .addTag('Contests', 'Contest management')
  .addTag('Learning', 'Learning resources and courses')
  .addTag('Community', 'Community features')
  .build();

/**
 * Swagger UI Custom Options
 */
export const swaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true, // Giữ token sau khi refresh
    docExpansion: 'none', // 'none' | 'list' | 'full'
    filter: true, // Cho phép search
    showRequestDuration: true, // Hiển thị thời gian request
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
    tryItOutEnabled: true, // Enable "Try it out" by default
    displayRequestDuration: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
  customSiteTitle: 'CodeRank API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .swagger-ui .info .title small { background: #49cc90; padding: 2px 8px; border-radius: 4px; }
    .swagger-ui .opblock.opblock-get { border-color: #61affe; background: rgba(97, 175, 254, 0.1); }
    .swagger-ui .opblock.opblock-post { border-color: #49cc90; background: rgba(73, 204, 144, 0.1); }
    .swagger-ui .opblock.opblock-put { border-color: #fca130; background: rgba(252, 161, 48, 0.1); }
    .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; background: rgba(249, 62, 62, 0.1); }
  `,
};
