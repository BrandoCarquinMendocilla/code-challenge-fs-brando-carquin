export class CallEvent {
  constructor(
    public id: string,
    public callId: string,
    public type: string,
    public timestamp: Date,
    public metadata?: Record<string, any>,
  ) {}
}
