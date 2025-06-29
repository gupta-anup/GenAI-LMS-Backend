import { LoggerService } from '../../shared/logger/logger.service';

/**
 * Decorator that automatically logs method entry and exit with execution time
 */
export function LogMethod(context?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodContext = context || className;

    descriptor.value = async function (...args: any[]) {
      const logger: LoggerService = this.logger;
      
      if (!logger) {
        console.warn(`LogMethod decorator: No logger found in ${className}. Make sure to inject LoggerService as 'logger'.`);
        return originalMethod.apply(this, args);
      }

      const startTime = Date.now();
      const methodName = `${className}.${propertyKey}`;
      
      logger.debug(`Method ${methodName} started`, methodContext);
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        logger.debug(`Method ${methodName} completed in ${duration}ms`, methodContext);
        logger.logPerformance(methodName, duration);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(
          `Method ${methodName} failed after ${duration}ms: ${error.message}`,
          error.stack,
          methodContext
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for logging method arguments (use with caution - avoid sensitive data)
 */
export function LogMethodWithArgs(context?: string, logArgs: boolean = false) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodContext = context || className;

    descriptor.value = async function (...args: any[]) {
      const logger: LoggerService = this.logger;
      
      if (!logger) {
        console.warn(`LogMethodWithArgs decorator: No logger found in ${className}. Make sure to inject LoggerService as 'logger'.`);
        return originalMethod.apply(this, args);
      }

      const startTime = Date.now();
      const methodName = `${className}.${propertyKey}`;
      
      if (logArgs) {
        logger.debug(`Method ${methodName} started with args: ${JSON.stringify(args)}`, methodContext);
      } else {
        logger.debug(`Method ${methodName} started`, methodContext);
      }
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        logger.debug(`Method ${methodName} completed in ${duration}ms`, methodContext);
        logger.logPerformance(methodName, duration);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(
          `Method ${methodName} failed after ${duration}ms: ${error.message}`,
          error.stack,
          methodContext
        );
        throw error;
      }
    };

    return descriptor;
  };
}
