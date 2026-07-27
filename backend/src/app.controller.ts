import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('healthz')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
