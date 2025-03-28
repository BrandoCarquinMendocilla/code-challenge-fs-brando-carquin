import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { CallService } from "../../application/services/call.service";
import { Call } from "../../domain/entities/call.entity";
import { CallListSchema } from "../../application/validator/call/call-list.validator";

@Controller("calls")
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get()
  async getCalls(@Query("status") status?: string): Promise<Call[]> {
    CallListSchema.parse({ status });
    return this.callService.getCalls(status);
  }
}
