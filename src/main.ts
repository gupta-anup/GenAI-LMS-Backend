import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './shared/logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { globalValidationPipe } from './common/pipes/global-validation.pipe';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Winston logger as the main logger
  const loggerService = app.get(LoggerService);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Add global pipes
  app.useGlobalPipes(globalValidationPipe);

  // Add global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService));

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  
  await app.listen(port);
  
  loggerService.log(`Application is running on port ${port}`, 'Bootstrap');
  loggerService.log(`Environment: ${process.env.NODE_ENV}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
