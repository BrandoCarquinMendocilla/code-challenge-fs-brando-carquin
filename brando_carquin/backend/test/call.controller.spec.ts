import { Test, TestingModule } from "@nestjs/testing";
import { CallService } from "../src/application/services/call.service";
import { InMemoryCallRepository } from "../src/infrastructure/repository/call.repository";
import { CallGateway } from "../src/infrastructure/websocket/event.gateway";
import { Call } from "../src/domain/entities/call.entity";

describe("CallService", () => {
  let callService: CallService;
  let callRepository: InMemoryCallRepository;
  let callGateway: CallGateway;

  beforeEach(async () => {
    const callRepositoryMock = {
      save: jest.fn(),
      findCalls: jest.fn(),
    };

    const callGatewayMock = {
      notifyClients: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallService,
        { provide: "CallRepository", useValue: callRepositoryMock },
        { provide: CallGateway, useValue: callGatewayMock },
      ],
    }).compile();

    callService = module.get<CallService>(CallService);
    callRepository = module.get<InMemoryCallRepository>("CallRepository");
    callGateway = module.get<CallGateway>(CallGateway);
  });

  it("should be defined", () => {
    expect(callService).toBeDefined();
  });

  describe("createCall", () => {
    it("should create and save a call, then notify clients", async () => {
      const newCall: Call = {
        id: "123",
        status: "waiting",
        queueId: "medical_spanish",
        startTime: new Date(),
      };

      await callService.createCall(newCall);

      expect(callRepository.save).toHaveBeenCalledWith(newCall);
      expect(callGateway.notifyClients).toHaveBeenCalledWith(
        "call_created",
        newCall,
      );
    });
  });

  describe("getCalls", () => {
    it("should return all calls when no status is provided", async () => {
      const mockCalls: Call[] = [
        {
          id: "123",
          status: "waiting",
          queueId: "medical_spanish",
          startTime: new Date(),
        },
        {
          id: "124",
          status: "active",
          queueId: "tech_support",
          startTime: new Date(),
        },
      ];

      jest.spyOn(callRepository, "findCalls").mockResolvedValue(mockCalls);

      const result = await callService.getCalls();
      expect(result).toEqual(mockCalls);
      expect(callRepository.findCalls).toHaveBeenCalledWith(undefined);
    });

    it("should return filtered calls based on status", async () => {
      const mockCalls: Call[] = [
        {
          id: "123",
          status: "waiting",
          queueId: "medical_spanish",
          startTime: new Date(),
        },
        {
          id: "124",
          status: "active",
          queueId: "tech_support",
          startTime: new Date(),
        },
      ];

      jest
        .spyOn(callRepository, "findCalls")
        .mockResolvedValue(
          mockCalls.filter((call) => call.status === "waiting"),
        );

      const result = await callService.getCalls("waiting");
      expect(result).toEqual([mockCalls[0]]);
      expect(callRepository.findCalls).toHaveBeenCalledWith("waiting");
    });
  });
});
