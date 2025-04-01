import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CallService } from "./application/services/call.service";
import { CallController } from "./infrastructure/controllers/call.controller";
import { InMemoryCallRepository } from "./infrastructure/repository/call.repository";
import { EventsController } from "./infrastructure/controllers/event.controller";
import { EventsService } from "./application/services/event.service";
import { ConfigModule } from "@nestjs/config";
import { CallGateway } from "./infrastructure/websocket/event.gateway";
import { InMemoryCallEventRepository } from "./infrastructure/repository/call-event.repository";
import { ApiKeyMiddleware } from "./application/middleware/api-key.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [CallController, EventsController],
  providers: [
    EventsService,
    CallGateway,
    CallService,
    {
      provide: "CallRepository",
      useClass: InMemoryCallRepository,
    },
    {
      provide: "CallEventRepository",
      useClass: InMemoryCallEventRepository,
    },
  ],
  exports: ["CallRepository"],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes(EventsController);
  }
}
