import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/messages')
  async getMessages(): Promise<string[]> {
    return this.appService.getMessages();
  }

  @Get('/private-messages/:userId1/:userId2')
  async getPrivateMessages(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ): Promise<string[]> {
    return this.appService.getPrivateMessages(userId1, userId2);
  }
}
