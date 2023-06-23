import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class GatewaysService {
  constructor(private readonly configService: ConfigService) {}

  @WebSocketServer()
  private server: Server;

  emit(data: any, event: string) {
    this.server.emit(event, data);
  }
}
