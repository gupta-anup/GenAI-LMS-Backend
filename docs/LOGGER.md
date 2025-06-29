# Logger Documentation

## Overview

This project uses Winston as the logging library with a custom NestJS wrapper for comprehensive logging functionality. The logger provides multiple log levels, file rotation, and structured logging.

## Features

- **Multiple Log Levels**: debug, info, warn, error, verbose, silly, http
- **File Rotation**: Automatic log file rotation with size limits
- **Structured Logging**: JSON format for production, colorized console for development
- **Context Support**: Add context to log messages for better organization
- **Specialized Logging Methods**: HTTP requests, database queries, business events, security events, performance metrics
- **Environment-Specific Configuration**: Different settings for development/production

## Configuration

The logger is configured through environment variables:

```bash
# Set log level (debug, info, warn, error)
LOG_LEVEL=info

# Node environment affects console output and file generation
NODE_ENV=development
```

## Log Files

Logs are stored in the `logs/` directory:

- `application.log` - All info level and above logs
- `error.log` - Error level logs only
- `debug.log` - Debug logs (development only)

Files automatically rotate when they reach 5MB, keeping the last 10 application logs, 5 error logs, and 3 debug logs.

## Usage

### Basic Logging

```typescript
import { LoggerService } from './shared/logger/logger.service';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  someMethod() {
    this.logger.info('Operation started', 'MyService');
    this.logger.debug('Debug information', 'MyService');
    this.logger.warn('Warning message', 'MyService');
    this.logger.error('Error occurred', error.stack, 'MyService');
  }
}
```

### HTTP Request Logging

The logging interceptor automatically logs all HTTP requests:

```typescript
// Automatically logged:
// - Incoming requests
// - Response time
// - Response status
// - Error details
```

### Database Query Logging

```typescript
export class UserService {
  async findUser(id: string) {
    const startTime = Date.now();
    
    // Execute query
    const user = await this.userRepository.findById(id);
    
    const duration = Date.now() - startTime;
    this.logger.logQuery('SELECT * FROM users WHERE id = $1', [id], duration);
    
    return user;
  }
}
```

### Business Event Logging

```typescript
export class OrderService {
  async createOrder(orderData: CreateOrderDto) {
    // Create order logic
    
    this.logger.logBusiness('Order Created', {
      orderId: order.id,
      userId: order.userId,
      amount: order.amount
    }, 'OrderService');
  }
}
```

### Security Event Logging

```typescript
export class AuthService {
  async login(credentials: LoginDto) {
    try {
      // Login logic
      this.logger.logSecurity('User Login Success', { email: credentials.email });
    } catch (error) {
      this.logger.logSecurity('User Login Failed', { 
        email: credentials.email, 
        error: error.message 
      }, 'error');
    }
  }
}
```

### Performance Logging

```typescript
export class ReportService {
  async generateReport() {
    const startTime = Date.now();
    
    // Generate report logic
    
    const duration = Date.now() - startTime;
    this.logger.logPerformance('generateReport', duration, 2000); // 2s threshold
  }
}
```

### Child Logger (with persistent context)

```typescript
export class UserService {
  private readonly userLogger: LoggerService;

  constructor(private readonly logger: LoggerService) {
    this.userLogger = this.logger.child('UserService');
  }

  async createUser(userData: CreateUserDto) {
    this.userLogger.info('Creating new user');
    this.userLogger.debug('User data received', JSON.stringify(userData));
    
    // All logs from userLogger will have 'UserService' context
  }
}
```

## Log Levels

- **error**: System errors, exceptions, critical issues
- **warn**: Warning messages, deprecated usage, potential issues
- **info**: General application flow, business events
- **http**: HTTP request/response logging
- **verbose**: Detailed information
- **debug**: Debugging information (development only)
- **silly**: Very detailed debug information

## Best Practices

1. **Use Appropriate Contexts**: Always provide context for log messages
2. **Don't Log Sensitive Data**: Avoid logging passwords, tokens, or personal information
3. **Use Structured Data**: Prefer JSON objects for complex data
4. **Performance Awareness**: Use debug level for verbose logging
5. **Error Stack Traces**: Always include stack traces for errors
6. **Consistent Naming**: Use consistent context names across your application

## Examples in Different Scenarios

### Controller Logging

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly logger: LoggerService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    this.logger.info(`Getting user with ID: ${id}`, 'UsersController');
    
    try {
      const user = await this.usersService.findOne(id);
      this.logger.debug(`User found: ${user.email}`, 'UsersController');
      return user;
    } catch (error) {
      this.logger.error(`Failed to get user ${id}`, error.stack, 'UsersController');
      throw error;
    }
  }
}
```

### Service Layer Logging

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {}

  async createUser(createUserDto: CreateUserDto) {
    this.logger.logBusiness('User Creation Started', createUserDto, 'UsersService');
    
    try {
      const user = await this.userRepository.save(createUserDto);
      this.logger.logBusiness('User Created Successfully', { userId: user.id }, 'UsersService');
      return user;
    } catch (error) {
      this.logger.error('User creation failed', error.stack, 'UsersService');
      throw error;
    }
  }
}
```

### Middleware Logging

```typescript
@Injectable()
export class CustomMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.info(`Middleware processing: ${req.method} ${req.url}`, 'CustomMiddleware');
    next();
  }
}
```

## Monitoring and Alerting

The logger can be integrated with monitoring tools:

- Log files can be monitored by tools like ELK Stack, Splunk, or CloudWatch
- Error logs can trigger alerts
- Performance logs can be used for monitoring application health
- Security logs can be used for intrusion detection

## Configuration Reference

The logger configuration is in `src/config/logger.config.ts` and supports:

- Console and file transports
- Log rotation settings
- Different formats for different environments
- Custom log levels
- Exception and rejection handling
