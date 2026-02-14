# CodeRank

A full-stack application for code ranking and evaluation.

## Project Structure

This monorepo contains two main applications:

```
coderank/
├── coderank-api/       # NestJS Backend API
└── coderank-client/    # Angular Frontend Application
```

### Backend (coderank-api)
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL with TypeORM
- **Authentication**: JWT & Google OAuth
- **Queue**: BullMQ for background jobs
- **API Docs**: Swagger UI at `/api`

[Read API Documentation](./coderank-api/README-AI.md)

### Frontend (coderank-client)
- **Framework**: Angular 21 (Standalone Components)
- **UI Library**: PrimeNG
- **Styling**: TailwindCSS 4
- **State**: Angular Signals

[Read Client Documentation](./coderank-client/README-AI.md)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v11 or higher)
- MySQL database

### Installation

#### Backend Setup
```bash
cd coderank-api
npm install
# Configure .env file
npm run start:dev
```

#### Frontend Setup
```bash
cd coderank-client
npm install
npm start
```

## Development

### API Development
```bash
cd coderank-api
npm run start:dev    # Start dev server with hot reload
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run seed         # Seed database
```

### Client Development
```bash
cd coderank-client
npm start            # Start dev server
npm run build        # Build for production
npm run test         # Run tests
```

## Architecture

### API Architecture
- Modular structure with NestJS modules
- TypeORM for database operations
- Passport.js for authentication
- BullMQ for queue management
- Swagger for API documentation

### Client Architecture
- Standalone components (Angular 21)
- Feature-based organization
- Signal-based state management
- PrimeNG component library
- TailwindCSS for styling

## Testing

### Backend Testing
- Unit tests: Jest
- E2E tests: Supertest
- Run with: `npm test`

### Frontend Testing
- Unit tests: Vitest
- Run with: `npm test`

## Contributing

1. Follow existing code patterns
2. Write tests for new features
3. Update documentation
4. Follow TypeScript best practices
5. Use conventional commits

## AI Development Guidelines

This project is optimized for AI-assisted development. See:
- [Copilot Instructions](./.github/copilot-instructions.md)
- [API AI Context](./coderank-api/README-AI.md)
- [Client AI Context](./coderank-client/README-AI.md)

## License

UNLICENSED - Private project
