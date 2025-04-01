import { Inject, Injectable } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { CallRepository } from "../inteface/call-repository.interface";
import { Call } from "../../domain/entities/call.entity";
import { CallEvent } from "../../domain/entities/call-event.entity";
import { CallEventRepository } from "../inteface/call-event-repository.interface";
import { v4 } from "uuid";

@Injectable()
@WebSocketGateway()
export class EventsService {
  @WebSocketServer()
  private server!: Server;

  constructor(
    @Inject("CallRepository") private readonly callRepository: CallRepository,
    @Inject("CallEventRepository")
    private readonly callEventRepository: CallEventRepository,
  ) { }

  private readonly validEvents = [
    "call_initiated",
    "call_routed",
    "call_answered",
    "call_hold",
    "call_ended",
    "call_retransfer",
  ];

  async processEvent(event: any): Promise<boolean> {
    if (!this.server) {
      console.warn("WebSocket no iniciado.");
      return false;
    }

    const { call_id, event_type, ...metadata } = event;

    if (!this.validEvents.includes(event_type)) {
      console.warn(`Evento inválido recibido: ${event_type}`);
      return false;
    }

    let call = await this.callRepository.findById(call_id);
    if (!call) {
      console.warn(`call_id no encontrado: ${call_id}, iniciando llamada.`);
      call = new Call(call_id, "waiting", metadata.queue_id, new Date());
      await this.callRepository.save(call);
    }

    switch (event_type) {
      case "call_initiated":
        if (call.status === "waiting") {
          call.status = "initiated";
          this.startSLATimer(call_id);
        }
        break;

      case "call_routed":
        if (call.status === "initiated") {
          call.status = "routed";
          this.startRouteTimer(call_id);
        }
        break;

      case "call_answered":
        if (call.status === "routed") {
          call.status = "active";
          if (metadata.wait_time && metadata.wait_time > 30) {
            this.server.emit("supervisor_alert", {
              call_id,
              wait_time: metadata.wait_time,
            });
          }
        }
        break;

      case "call_hold":
        if (call.status === "active") {
          call.status = "on_hold";
          this.startHoldTimer(call_id);
        }
        break;

      case "call_ended":
        if (call.status === "active" || call.status === "on_hold") {
          call.status = "ended";
          if (metadata.duration && metadata.duration < 10) {
            this.server.emit("flag_short_call", { call_id });
          }
        }
        break;

      case "call_retransfer":
        if (call.status === "routed") {
          this.server.emit("call_retransfer", { call_id });
        }
        break;
    }
    call.queueId = event_type;
    const callEvent = new CallEvent(
      v4(),
      call_id,
      event_type,
      new Date(),
      metadata,
    );

    await Promise.all([
      this.callRepository.save(call),
      this.callEventRepository.save(callEvent),
    ]);
    this.server.emit("call_update", call);
    return true;
  }

  async eventHistory(status?: string, callId?: string) {
    const eventHistory = await this.callEventRepository.findAll(status, callId);
    console.log("Fetched event history:", eventHistory);

    if (!eventHistory || eventHistory.length === 0) {
      console.log("No events found.");
    }


    const uniqueCallIds = new Set(eventHistory.map((event) => event.callId));
    console.log("Unique call IDs:", uniqueCallIds);

    const callIdsWithInitiatedType = new Set<string>();
    eventHistory.forEach((event) => {
      if (event.type === "initiated") {
        callIdsWithInitiatedType.add(event.callId);
      }
    });

    console.log("Call IDs with initiated type:", callIdsWithInitiatedType);

    const generateCalls = this.generateDynamicCalls()
    console.log("generateCalls:", generateCalls);

    const totalCall = uniqueCallIds.size + generateCalls.totalCalls;
    const callInProgress = Math.round(callIdsWithInitiatedType.size + (generateCalls.totalCalls * 0.2));
    const second = generateCalls.averageSeconds + 's';
    const randomPorcentaje = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    const compliance = randomPorcentaje + '%'

    return {
      values: generateCalls.callRecords,
      key: generateCalls.hours,
      totalCalls: totalCall,
      callInProgress,
      second,
      seconds: generateCalls.seconds,
      compliance,
      eventHistory
    }
  }

  private startSLATimer(call_id: string) {
    setTimeout(async () => {
      const call = await this.callRepository.findById(call_id);
      if (call?.status === "initiated") {
        this.server.emit("sla_violation", { call_id });
      }
    }, 30000);
  }

  private startRouteTimer(call_id: string) {
    setTimeout(async () => {
      const call = await this.callRepository.findById(call_id);
      if (call?.status === "routed") {
        this.processEvent({ call_id, type: "call_retransfer" });
      }
    }, 15000);
  }

  private startHoldTimer(call_id: string) {
    setTimeout(async () => {
      const call = await this.callRepository.findById(call_id);
      if (call?.status === "on_hold") {
        this.server.emit("hold_exceeded", { call_id });
      }
    }, 60000);
  }

  private generateDynamicCalls() {
    const currentHour = new Date().getHours();
    console.log("Current Hour:", currentHour);

    const callCounts = [3, 20, 50, 80];

    const callRecords = [];
    const hours = [];
    const seconds = [];

    let totalCalls = 0;
    if (currentHour < 1) {
      console.log("Error: currentHour is less than 1. No calls will be generated.");
      return { hours: [], callRecords: [], totalCalls: 0 };
    }

    for (let i = 1; i <= currentHour; i++) {
      if (i % 2 === 0) {
        const randomCallCount = callCounts[Math.floor(Math.random() * callCounts.length)];
        callRecords.push(randomCallCount);
  
        const hourLabel = `${i === 12 ? 12 : i % 12} ${i < 12 ? 'AM' : 'PM'}`;
        hours.push(hourLabel);
  
        totalCalls += randomCallCount;

        const randomSeconds = Math.floor(Math.random() * (60 - 10 + 1)) + 10;
        seconds.push(randomSeconds);
        console.log(`Hour: ${hourLabel}, Calls: ${randomCallCount},  Second: ${randomSeconds},`);
      }
    }
  
    const totalSeconds = seconds.reduce((acc, curr) => acc + curr, 0);
    const averageSeconds = seconds.length > 0 ? Math.floor(totalSeconds / seconds.length) : 0;

    return {
      hours,
      callRecords,
      seconds,
      totalCalls,
      averageSeconds
    };
  }
}
