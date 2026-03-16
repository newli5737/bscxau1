import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private adminSockets = new Set<string>();

  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) { client.disconnect(); return; }

      const payload = this.jwt.verify(token as string);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isAdmin) { client.disconnect(); return; }

      this.adminSockets.add(client.id);
      console.log(`🔔 Admin connected: ${client.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.adminSockets.delete(client.id);
  }

  notifyAdmin(event: string, data: any) {
    for (const socketId of this.adminSockets) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
