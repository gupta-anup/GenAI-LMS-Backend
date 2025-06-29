import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './shared/logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './shared/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { CoursesModule } from './modules/courses/courses.module';
import { appConfig, authConfig, databaseConfig, emailConfig, loggerConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, emailConfig, loggerConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule,
    DatabaseModule,
    EmailModule,
    AuthModule,
    HealthModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
