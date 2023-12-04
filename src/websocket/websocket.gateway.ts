import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { RedisService } from 'nestjs-redis';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: '*',
})
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer() private server: Server;

  constructor(private readonly redisService: RedisService) {}

  handleConnection(client: Socket) {
    console.log(`Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handlePrivateMessage(client: Socket, payload: any) {
    console.log('message received on the server:', payload);

    const message = {
      userName: payload.name,
      content: payload.content,
      timestamp: new Date(),
    };

    const messageString = JSON.stringify(message);
    console.log(messageString);

    await this.redisService.getClient().rpush('sendMessage', messageString);
  }
}
