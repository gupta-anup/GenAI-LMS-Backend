import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIIntegrationService } from './ai-integration.service';

@Module({
  imports: [ConfigModule],
  providers: [AIIntegrationService],
  exports: [AIIntegrationService],
})
export class AIIntegrationModule {}
