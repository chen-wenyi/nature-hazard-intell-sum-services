import { Module } from '@nestjs/common';

import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ScrapeService } from './services/scrape/scrape.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ScrapeService],
})
export class AppModule {}
