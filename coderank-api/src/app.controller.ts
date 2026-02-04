import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Application Controller
 * 
 * Handles general application endpoints like health checks
 */
@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   */
  @Get()
  @ApiOperation({ 
    summary: 'Health Check',
    description: 'Kiểm tra trạng thái hoạt động của API. Trả về "Hello World!" nếu server đang hoạt động.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Server is running',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  @ApiResponse({ 
    status: HttpStatus.SERVICE_UNAVAILABLE, 
    description: 'Service unavailable' 
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
