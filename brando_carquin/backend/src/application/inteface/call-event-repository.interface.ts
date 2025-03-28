import { CallEvent } from "../../domain/entities/call-event.entity";

export interface CallEventRepository {
  save(event: CallEvent): Promise<void>;
  findById(id: string): Promise<CallEvent | null>;
  findAll(status?: string, callId?: string): Promise<CallEvent[]>;
}
