#!/bin/bash

# NestJS Production Directory Structure Setup Script
# This script creates a production-ready directory structure for NestJS

echo "🚀 Setting up NestJS Production Directory Structure..."

# Create main directories
echo "📁 Creating main directories..."

# Common directory structure
mkdir -p src/common/{constants,decorators,dto,enums,exceptions,filters,guards,interceptors,interfaces,middlewares,pipes,utils}

# Config directory
mkdir -p src/config

# Database directory structure
mkdir -p src/database/{migrations,seeds,entities,repositories}

# Modules directory structure
mkdir -p src/modules/{auth,users,health,cache}
mkdir -p src/modules/auth/{dto,guards,strategies,interfaces}
mkdir -p src/modules/users/{dto,entities,interfaces}

# Shared directory structure
mkdir -p src/shared/{services,modules}

# Types directory
mkdir -p src/types

# Test directory structure
mkdir -p test/fixtures

echo "📄 Creating index.ts files for barrel exports..."

# Create index.ts files for barrel exports
touch src/common/constants/index.ts
touch src/common/decorators/index.ts
touch src/common/dto/index.ts
touch src/common/enums/index.ts
touch src/common/exceptions/index.ts
touch src/common/filters/index.ts
touch src/common/guards/index.ts
touch src/common/interceptors/index.ts
touch src/common/interfaces/index.ts
touch src/common/middlewares/index.ts
touch src/common/pipes/index.ts
touch src/common/utils/index.ts

touch src/config/index.ts
touch src/database/entities/index.ts
touch src/database/repositories/index.ts

touch src/modules/auth/dto/index.ts
touch src/modules/auth/guards/index.ts
touch src/modules/auth/strategies/index.ts
touch src/modules/auth/interfaces/index.ts

touch src/modules/users/dto/index.ts
touch src/modules/users/entities/index.ts
touch src/modules/users/interfaces/index.ts

touch src/shared/services/index.ts
touch src/shared/modules/index.ts

touch src/types/index.ts

echo "📝 Creating common files..."

# Common constants
cat > src/common/constants/app.constants.ts << 'EOF'
export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  JWT_EXPIRY: '24h',
  BCRYPT_ROUNDS: 12,
} as const;
EOF

cat > src/common/constants/error-messages.constants.ts << 'EOF'
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden resource',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
} as const;
EOF

# Common DTOs
cat > src/common/dto/pagination.dto.ts << 'EOF'
import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
EOF

cat > src/common/dto/base-response.dto.ts << 'EOF'
import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  timestamp: string;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
EOF

# Common enums
cat > src/common/enums/user-role.enum.ts << 'EOF'
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}
EOF

cat > src/common/enums/status.enum.ts << 'EOF'
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted',
}
EOF

# Config files
cat > src/config/app.config.ts << 'EOF'
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN || '*',
  },
}));
EOF

cat > src/config/database.config.ts << 'EOF'
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'nestjs_app',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
}));
EOF

cat > src/config/auth.config.ts << 'EOF'
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
}));
EOF

# Database entities
cat > src/database/entities/base.entity.ts << 'EOF'
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
EOF

# Create module files
echo "🔧 Creating module files..."

# Auth module
cat > src/modules/auth/auth.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
EOF

cat > src/modules/auth/auth.controller.ts << 'EOF'
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }
}
EOF

cat > src/modules/auth/auth.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(loginDto: any) {
    // TODO: Implement login logic
    return { message: 'Login endpoint' };
  }

  async register(registerDto: any) {
    // TODO: Implement register logic
    return { message: 'Register endpoint' };
  }
}
EOF

# Users module
cat > src/modules/users/users.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
EOF

cat > src/modules/users/users.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
EOF

cat > src/modules/users/users.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  findAll() {
    return { message: 'Get all users' };
  }

  findOne(id: string) {
    return { message: `Get user with id: ${id}` };
  }

  create(createUserDto: any) {
    return { message: 'Create user', data: createUserDto };
  }

  update(id: string, updateUserDto: any) {
    return { message: `Update user with id: ${id}`, data: updateUserDto };
  }

  remove(id: string) {
    return { message: `Delete user with id: ${id}` };
  }
}
EOF

# Health module
cat > src/modules/health/health.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
EOF

cat > src/modules/health/health.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return this.healthService.check();
  }
}
EOF

cat > src/modules/health/health.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
EOF

echo "📋 Creating .gitkeep files for empty directories..."
touch src/database/migrations/.gitkeep
touch src/database/seeds/.gitkeep
touch test/fixtures/.gitkeep

echo "🔧 Creating environment template..."
cat > .env.example << 'EOF'
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=nestjs_app

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# CORS
CORS_ENABLED=true
CORS_ORIGIN=*

# Redis (if using)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (if using)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
EOF

echo "✅ Directory structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example to .env and update with your values"
echo "2. Install additional dependencies if needed:"
echo "   npm install @nestjs/config @nestjs/swagger class-validator class-transformer"
echo "3. Update your app.module.ts to import the new modules"
echo "4. Implement the TODOs in the generated files"
echo ""
echo "🎉 Your NestJS project now has a production-ready structure!"