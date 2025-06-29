import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YouTubeIntegrationService } from './youtube-integration.service';

@Module({
  imports: [ConfigModule],
  providers: [YouTubeIntegrationService],
  exports: [YouTubeIntegrationService],
})
export class YouTubeIntegrationModule {}
