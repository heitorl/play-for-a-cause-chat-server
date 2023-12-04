import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}
  async getMessages(): Promise<string[]> {
    const messages = await this.redisService
      .getClient()
      .lrange('sendMessage', 0, -1);

    return messages.map((message) => JSON.parse(message));
  }
}
