import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from "../src/application/services/event.service";
import { CallGateway } from "../src/infrastructure/websocket/event.gateway";
import { CallService } from '../src/application/services/call.service';
import { Call } from '../src/domain/entities/call.entity';
import { InMemoryCallRepository } from '../src/infrastructure/repository/call.repository';
import { Server } from "socket.io";

describe('EventsService', () => {
    let service: EventsService;
    let callService: CallService;
    let callEventRepository: any;
    let mockServer: Server;
    let callRepository: InMemoryCallRepository;

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

    beforeEach(async () => {
        mockServer = { emit: jest.fn() } as any;

        const callRepositoryMock = {
            save: jest.fn(),
            findCalls: jest.fn(),
            findById: jest.fn(),
        };

        const callGatewayMock = {
            notifyClients: jest.fn(),
        };

        callEventRepository = {
            save: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                CallService,
                { provide: "CallRepository", useValue: callRepositoryMock },
                { provide: 'CallEventRepository', useValue: callEventRepository },
                { provide: CallGateway, useValue: callGatewayMock },
            ],
        })
        .compile();

        callService = module.get<CallService>(CallService);
        service = module.get<EventsService>(EventsService);
        callRepository = module.get<InMemoryCallRepository>("CallRepository");
        service['server'] = mockServer; 
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processEvent', () => {
        it('should process a valid event successfully', async () => {
            const event = { call_id: '1', event_type: 'call_initiated', metadata: {} };

            jest.spyOn(callRepository, "findById").mockResolvedValue(mockCalls[0]);
            jest.spyOn(callEventRepository, "save").mockResolvedValue({});
            jest.spyOn(callEventRepository, "findAll").mockResolvedValue([]);

            const result = await service.processEvent(event);

            expect(result).toBe(true);
            expect(mockServer.emit).toHaveBeenCalledWith('call_update', expect.anything());
            expect(callEventRepository.save).toHaveBeenCalledTimes(1); 
        });

        it('should return false for an invalid event type', async () => {
            const event = { call_id: '1', event_type: 'invalid_event', metadata: {} };

            jest.spyOn(callRepository, "findById").mockResolvedValue(mockCalls[0]);
            jest.spyOn(callEventRepository, "save").mockResolvedValue({});
            jest.spyOn(callEventRepository, "findAll").mockResolvedValue([]);

            const result = await service.processEvent(event);

            expect(result).toBe(false);
            expect(mockServer.emit).not.toHaveBeenCalled();
        });

        it('should create a new call if the call_id does not exist', async () => {
            const event = { call_id: 'new_call', event_type: 'call_initiated', metadata: { queue_id: 'queue1' } };

            jest.spyOn(callEventRepository, "save").mockResolvedValue({});
            jest.spyOn(callEventRepository, "findAll").mockResolvedValue([]);
            jest.spyOn(callRepository, "save").mockResolvedValue();
            jest.spyOn(callRepository, "findById").mockResolvedValue(null);

            const result = await service.processEvent(event);

            expect(result).toBe(true);
            expect(callEventRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                callId: 'new_call',
            }));
        });
    });

    describe('eventHistory', () => {
        it('should return all events if no filters are applied', async () => {
            jest.spyOn(callEventRepository, "findAll").mockResolvedValue(mockCalls);

            const history = await service.eventHistory();
            expect(history.length).toBe(2);
        });

        it('should return filtered events based on status', async () => {
            jest.spyOn(callEventRepository, "findAll").mockResolvedValue([mockCalls[0]]);

            const history = await service.eventHistory('call_initiated');
            expect(history.length).toBe(1);
        });
    });
});
