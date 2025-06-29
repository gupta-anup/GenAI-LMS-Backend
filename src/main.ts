import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './shared/logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Winston logger as the main logger
  const loggerService = app.get(LoggerService);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Add global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService));

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  
  await app.listen(port);
  
  loggerService.log(`Application is running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
