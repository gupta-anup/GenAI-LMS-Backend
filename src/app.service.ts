import { Injectable } from '@nestjs/common';
import { LoggerService } from './shared/logger/logger.service';
import { LogMethod } from './common/decorators/log-method.decorator';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  @LogMethod('AppService')
  getHello(): string {
    this.logger.info('getHello method called', 'AppService');
    
    // Example of different log levels
    this.logger.debug('This is a debug message', 'AppService');
    this.logger.logBusiness('User requested hello message', { method: 'getHello' });
    
    return 'Hello World!';
  }

  // Example of error logging
  @LogMethod('AppService')
  getError(): void {
    try {
      throw new Error('This is a test error');
    } catch (error) {
      this.logger.error('An error occurred in getError method', error.stack, 'AppService');
      throw error;
    }
  }

  // Example of performance logging
  @LogMethod('AppService')
  async getSlowOperation(): Promise<string> {
    const startTime = Date.now();
    
    // Simulate slow operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const duration = Date.now() - startTime;
    this.logger.logPerformance('getSlowOperation', duration, 1000);
    
    return 'Slow operation completed';
  }
}
