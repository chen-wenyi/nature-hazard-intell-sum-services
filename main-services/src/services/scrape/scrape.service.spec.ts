import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ScrapeRepository } from 'src/dao/scrape.repository';
import { ScrapeService } from './scrape.service';

describe('ScrapeService', () => {
  let service: ScrapeService;
  let scrapeRepository: {
    upsertSevereWeatherOutlook: jest.Mock;
  };

  beforeEach(async () => {
    scrapeRepository = {
      upsertSevereWeatherOutlook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapeService,
        {
          provide: ScrapeRepository,
          useValue: scrapeRepository,
        },
      ],
    }).compile();

    service = module.get<ScrapeService>(ScrapeService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('upserts severe weather outlook for valid payload', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    scrapeRepository.upsertSevereWeatherOutlook.mockResolvedValue('inserted');

    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          issuedDate: '2026-03-27',
          outlookItems: [{ date: '2026-03-27', outlook: 'Sunny' }],
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await service.updateSevereWeatherOutlook();

    expect(scrapeRepository.upsertSevereWeatherOutlook).toHaveBeenCalledWith({
      issuedDate: '2026-03-27',
      outlookItems: [{ date: '2026-03-27', outlook: 'Sunny' }],
    });
    expect(logSpy).toHaveBeenCalledWith(
      'Severe Weather Outlook was updated in DB.',
    );
  });

  it('logs up-to-date when repository reports unchanged', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    scrapeRepository.upsertSevereWeatherOutlook.mockResolvedValue('unchanged');

    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          issuedDate: '2026-03-27',
          outlookItems: [{ date: '2026-03-27', outlook: 'Cloudy' }],
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await service.updateSevereWeatherOutlook();

    expect(logSpy).toHaveBeenCalledWith(
      'Severe Weather Outlook is already up-to-date.',
    );
  });

  it('does not upsert and logs error for invalid payload', async () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: { issuedDate: '2026-03-27' } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await service.updateSevereWeatherOutlook();

    expect(scrapeRepository.upsertSevereWeatherOutlook).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid severe weather outlook payload:'),
    );
  });
});
