import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { DiscussionService } from './discussion.service';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway()
export class DiscussionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly discussionService: DiscussionService) { }

    async handleConnection(socket: Socket) {
        const discussionId = socket.handshake.query.discussionId as string;
        socket.join(`discussion-${discussionId}`);
        const messages = await this.discussionService.findAll(discussionId);
        socket.emit('loadMessages', messages);
    }

    async handleDisconnect(socket: Socket) {
        const discussionId = socket.handshake.query.discussionId;
        socket.leave(`discussion-${discussionId}`);
    }

    async sendMessage(dto: MessageDto) {
        const message = await this.discussionService.create(dto);
        this.server.to(`discussion-${dto.discussionId}`).emit('newMessage', message);
    }

    @SubscribeMessage('writeMessage')
    async onMessage(client: Socket, dto: MessageDto) {
        await this.sendMessage(dto);
    }
}
