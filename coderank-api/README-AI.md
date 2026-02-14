# CodeRank API - AI Context

## Architecture Overview

This is a **NestJS REST API** serving the CodeRank application.

### Key Modules
- **Auth**: JWT & Google OAuth authentication
- **Users**: User management and profiles
- **Queue**: BullMQ job processing
- **Database**: TypeORM with MySQL

### Project Structure
```
src/
├── auth/          # Authentication module
├── common/        # Shared utilities, decorators, guards
├── config/        # Configuration files
├── db/            # Database seeds and migrations
├── modules/       # Business logic modules
│   └── {module}/
│       ├── dto/
│       ├── entities/
│       ├── {module}.controller.ts
│       ├── {module}.service.ts
│       └── {module}.module.ts
├── main.ts        # Application entry point
└── app.module.ts  # Root module
```

### Important Patterns

#### Controllers
- Use decorators for routing: `@Controller()`, `@Get()`, `@Post()`, etc.
- Apply guards for authentication: `@UseGuards(JwtAuthGuard)`
- Use DTOs for validation: `@Body() createDto: CreateDto`
- Add Swagger decorators: `@ApiTags()`, `@ApiOperation()`

#### Services
- Inject dependencies via constructor
- Use TypeORM repositories: `@InjectRepository(Entity)`
- Implement business logic, not HTTP concerns
- Handle errors with appropriate exceptions

#### DTOs
- Extend from base DTOs when appropriate
- Use class-validator decorators: `@IsString()`, `@IsNotEmpty()`
- Use class-transformer decorators: `@Expose()`, `@Exclude()`

#### Entities
- Use TypeORM decorators: `@Entity()`, `@Column()`, `@PrimaryGeneratedColumn()`
- Define relationships: `@ManyToOne()`, `@OneToMany()`, `@ManyToMany()`
- Add indexes for frequently queried fields

### Authentication Flow
1. User authenticates via JWT or Google OAuth
2. JwtAuthGuard validates token
3. User object attached to request: `@CurrentUser()`
4. Protected routes accessible with valid token

### Environment Variables
- Defined in `.env` file (not committed)
- Validated using Joi schema in config module
- Accessed via ConfigService

### Database
- MySQL database with TypeORM
- Entities auto-sync in development (be cautious!)
- Migrations for production
- Seeds for test data: `npm run seed`

### Queue System
- BullMQ for background jobs
- Bull Board for monitoring at `/queues`
- Define processors in queue module

### API Documentation
- Swagger UI available at `/api`
- Auto-generated from decorators
- Keep decorators updated

## When Generating Code

1. **Controllers**: Include Swagger docs, guards, and DTOs
2. **Services**: Inject repositories, implement error handling
3. **DTOs**: Add validation decorators
4. **Entities**: Define proper relationships and indexes
5. **Tests**: Follow existing patterns with Jest
6. **Modules**: Register in appropriate parent module

## Common Tasks

### Create a New Module
```bash
nest g module modules/{name}
nest g controller modules/{name}
nest g service modules/{name}
```

### Create an Entity
- Define TypeORM entity
- Create DTOs (create, update, response)
- Create service methods
- Create controller endpoints
- Add to module imports

### Add Authentication
- Apply `@UseGuards(JwtAuthGuard)` to controller/route
- Use `@CurrentUser()` decorator to access user
- Check permissions in guard or service layer
