import { ValidationPipe } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true, // Strip properties that don't have decorators
  forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
  transform: true, // Transform payloads to DTO instances
  transformOptions: {
    enableImplicitConversion: true, // Convert string to number, etc.
  },
  validationError: {
    target: false, // Don't expose the target object in error
    value: false, // Don't expose the validated value in error
  },
});
