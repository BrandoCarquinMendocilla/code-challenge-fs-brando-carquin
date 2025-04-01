import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiKeyMiddleware } from '../src/application/middleware/api-key.middleware';

describe('ApiKeyMiddleware', () => {
  let middleware: ApiKeyMiddleware;

  beforeEach(async () => {
    process.env.API_KEY = 'valid-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeyMiddleware],
    }).compile();

    middleware = module.get<ApiKeyMiddleware>(ApiKeyMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next() if apiKey is valid', () => {
    const req = {
        headers: { 'x-api-key': process.env.API_KEY },
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if apiKey is invalid or missing', () => {
    const req = { headers: {} } as Request;
    const res = {} as Response;
    const next = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if apiKey is invalid', () => {
    const req = {
        headers: { 'x-api-key': 'invalid-api-key' },
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(UnauthorizedException);
  });
});
