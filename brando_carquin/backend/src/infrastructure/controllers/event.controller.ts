import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { EventsService } from "../../application/services/event.service";
import { SendEventSchema } from "../../application/validator/event/event.valdiator";
import { EventHistorySchema } from "../../application/validator/event/event-history.validator";

@Controller("api/events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async executeEvent(@Body() eventData: object) {
    try {
      const validatedData = SendEventSchema.parse(eventData);
      return this.eventsService.processEvent(validatedData);
    } catch (error: any) {
      throw new BadRequestException(error.errors);
    }
  }

  @Get()
  async listEventHistory(
    @Query("status") status?: string,
    @Query("call_id") callId?: string,
  ) {
    try {
      EventHistorySchema.parse({ status, call_id: callId });
      return this.eventsService.eventHistory(status, callId);
    } catch (error: any) {
      throw new BadRequestException(error.errors);
    }
  }
}
