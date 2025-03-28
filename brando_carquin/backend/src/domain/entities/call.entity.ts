export class Call {
  constructor(
    public id: string,
    public status:
      | "waiting"
      | "initiated"
      | "routed"
      | "active"
      | "on_hold"
      | "ended",
    public queueId: string,
    public startTime: Date,
    public endTime?: Date,
  ) {}
}
