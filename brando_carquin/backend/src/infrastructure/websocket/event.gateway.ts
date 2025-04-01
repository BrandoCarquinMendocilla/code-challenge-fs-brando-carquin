import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
})
export class CallGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  notifyClients(event: string, data: any) {
    this.server.emit(event, data);
  }
}
