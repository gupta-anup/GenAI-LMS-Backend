import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';
import loggerConfig from '../../config/logger.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(loggerConfig),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('logger');
        if (!config) {
          throw new Error('Logger configuration not found');
        }
        return config;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
