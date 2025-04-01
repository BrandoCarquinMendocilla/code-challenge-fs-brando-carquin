import { Inject, Injectable } from "@nestjs/common";
import { CallRepository } from "../inteface/call-repository.interface";
import { Call } from "../../domain/entities/call.entity";
import { CallGateway } from "../../infrastructure/websocket/event.gateway";

@Injectable()
export class CallService {
  constructor(
    @Inject("CallRepository") private readonly callRepository: CallRepository,
    private readonly callGateway: CallGateway,
  ) {}

  async createCall(call: Call): Promise<void> {
    call.status = "waiting";
    await this.callRepository.save(call);
    this.callGateway.notifyClients("call_created", call);
    console.info("Registro creado exitosamente");
  }

  async getCalls(status?: string): Promise<Call[]> {
    return this.callRepository.findCalls(status);
  }
}
