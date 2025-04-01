import { Call } from "../../domain/entities/call.entity";

export interface CallRepository {
  save(call: Call): Promise<void>;
  findById(id: string): Promise<Call | null>;
  findCalls(status?: string): Promise<Call[]>;
}
