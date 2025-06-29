import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  check() {
    return this.healthService.check();
  }

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Protected health check' })
  @ApiResponse({ status: 200, description: 'Authentication is working' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAuthHealth() {
    return {
      status: 'ok',
      message: 'Authentication is working',
      timestamp: new Date().toISOString(),
    };
  }
}
