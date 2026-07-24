import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { ClerkService } from './clerk.service';

describe('ClerkService', () => {
  let service: ClerkService;
  let cwdSpy: jest.SpyInstance<string, []>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkService,
        {
          provide: 'CLERK_CLIENT',
          useValue: {
            users: {
              getUserList: jest.fn(),
              deleteUser: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ClerkService>(ClerkService);
  });

  afterEach(() => {
    cwdSpy?.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a graceful error when the CSV file is missing', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-service-'));
    cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(tempDir);

    const result = await service.importUsers();

    expect(result).toEqual({
      imported: 0,
      failed: 0,
      error: expect.stringContaining('CSV file not found'),
    });
  });
});
