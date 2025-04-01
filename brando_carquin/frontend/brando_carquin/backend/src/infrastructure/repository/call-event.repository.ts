import { Injectable } from "@nestjs/common";
import { CallEvent } from "../../domain/entities/call-event.entity";
import { CallEventRepository } from "../../application/inteface/call-event-repository.interface";

@Injectable()
export class InMemoryCallEventRepository implements CallEventRepository {
  public calls: CallEvent[] = [];

  async save(call: CallEvent): Promise<void> {
    const index = this.calls.findIndex((c) => c.id === call.id);
    if (index !== -1) {
      this.calls[index] = call;
    } else {
      this.calls.push(call);
    }
  }

  async findById(id: string): Promise<CallEvent | null> {
    return this.calls.find((call) => call.id === id) || null;
  }

  async findAll(status?: string, callId?: string): Promise<CallEvent[]> {
    return this.calls.filter(
      (call) =>
        (!status || call.type === status) &&
        (!callId || call.callId === callId),
    );
  }
}
