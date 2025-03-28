import { Injectable } from "@nestjs/common";
import { Call } from "../../domain/entities/call.entity";
import { CallRepository } from "../../application/inteface/call-repository.interface";

@Injectable()
export class InMemoryCallRepository implements CallRepository {
  public calls: Call[] = [];

  async save(call: Call): Promise<void> {
    const index = this.calls.findIndex((c) => c.id === call.id);
    if (index !== -1) {
      this.calls[index] = call;
    } else {
      this.calls.push(call);
    }
  }

  async findById(id: string): Promise<Call | null> {
    return this.calls.find((call) => call.id === id) || null;
  }

  async findCalls(status?: string): Promise<Call[]> {
    if (!status) {
      return this.calls;
    }
    return this.calls.filter((call) => call.status === status);
  }
}
