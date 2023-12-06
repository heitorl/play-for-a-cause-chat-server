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

    // Aqui você pode verificar o tipo de autenticação que deseja
    if (client.handshake.auth.type === 'public') {
      this.handlePublicConnection(client);
    } else if (client.handshake.auth.type === 'private') {
      this.handlePrivateConnection(client);
    } else {
      console.log('Invalid authentication type');
      client.disconnect();
    }
  }

  private handlePublicConnection(client: Socket) {
    // Lógica específica para conexão pública
    console.log('Public connection', client.id);
  }

  private handlePrivateConnection(client: Socket) {
    // Lógica específica para conexão privada
    console.log('Private connection', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendPublicMessage')
  async handleMessage(client: Socket, payload: any) {
    console.log('message received on the server:', payload);

    const message = {
      userName: payload.userName,
      content: payload.content,
      timestamp: new Date(),
    };

    const messageString = JSON.stringify(message);
    console.log(messageString, 'msssssg');

    client.broadcast.emit('sendPublicMessage', message);

    await this.redisService
      .getClient()
      .rpush('sendPublicMessage', messageString);
  }

  @SubscribeMessage('sendPrivateMessage')
  async handlePrivateMessage(client: Socket, payload: any) {
    try {
      const { content, toUser, userName } = payload;

      const toUserId = toUser.id;

      const fromUserId = client.handshake.auth.userId;

      const message = {
        userName,
        content,
        timestamp: new Date(),
        fromUserId,
        toUserId,
      };

      const messageString = JSON.stringify(message);

      client.broadcast.emit('sendPrivateMessage', message);

      const redisClient = await this.redisService.getClient();
      await redisClient.rpush(`user:${fromUserId}:messages`, messageString);
      await redisClient.rpush(`user:${toUserId}:messages`, messageString);

      const toUserSocket = this.server.sockets.sockets.get(toUserId);

      if (toUserSocket) {
        toUserSocket.emit('sendPrivateMessage', message);
      }
    } catch (error) {
      console.error('Error handling private message:', error);
    }
  }
}
