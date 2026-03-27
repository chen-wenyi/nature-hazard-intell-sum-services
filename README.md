# Natural Hazard Intelligence Summary

A near real-time natural hazard intelligence platform that:

- Scrapes latest hazard content from MetService
- Stores outlooks and alerts in MongoDB
- Regenerates AI summaries when source data changes
- Pushes update events to the UI through Ably pub/sub

## Architecture

The project has 3 main applications plus MongoDB:

- main-services: backend orchestration and scheduled jobs
- scrape-services: web scraping service for MetService pages
- ui: frontend presentation layer
- mongodb: persistent storage

Main flow:

1. main-services runs cron jobs to refresh severe outlook, thunderstorm outlook, and issued alerts.
2. main-services fetches scraped content from scrape-services and CAP feed content from MetService.
3. If new content is detected, main-services stores it and regenerates summaries with OpenAI model gpt-5-mini.
4. main-services publishes update events through Ably.
5. ui subscribes to the Ably channel and refreshes the screen state.

## Project Structure

### main-services

Purpose: cron-driven backend for refresh and orchestration.

Responsibilities:

- Refresh issued alerts and outlooks on schedule
- Detect stale vs new source data
- Persist records to MongoDB
- Regenerate AI summaries when new data arrives
- Publish backend update events to Ably for frontend sync

### scrape-services

Purpose: scraping layer for MetService pages.

Responsibilities:

- Scrape severe weather outlook page
- Scrape thunderstorm outlook page
- Return normalized JSON payloads to main-services

### ui

Purpose: presentation and user interaction.

Responsibilities:

- Show outlooks, alerts, and AI summaries
- Subscribe to Ably channel events
- React to backend update and generation events in near real-time

## Tech Stack

- Backend framework: NestJS (main-services)
- Scraping service: Hono + Playwright (scrape-services)
- Frontend: React + TanStack stack (ui)
- Database: MongoDB
- AI model: gpt-5-mini
- Realtime messaging: Ably pub/sub

## Prerequisites

- Docker Engine
- Docker install guide: https://docs.docker.com/engine/install/
- OpenAI API key
- Ably API key

## Environment Setup

1. Copy environment variables template:

```bash
cp .env.schema .env
```

2. Open .env and set required secrets:

```env
OPENAI_API_KEY=your_openai_api_key_here
ABLY_API_KEY=your_ably_api_key_here
```

3. Ensure channel value is configured:

```env
ABLY_CHANNEL_NAME=nhis-nest-channel
```

4. If deploying to cloud, set environment variables in your cloud provider instead of committing secrets.

## Run

Run from the project root:

```bash
docker compose up --build
```

## Access

- UI: http://localhost:3001
- main-services: http://localhost:3000
- scrape-services: http://localhost:4000
- mongodb: localhost:27017

## Stop

Run from the project root:

```bash
docker compose down
```

## Operational Notes

- main-services schedules recurring updates for severe weather outlook, thunderstorm outlook, and issued warnings and watches.
- AI summaries are regenerated only when newly scraped data differs from latest stored records.
- Ably is used as pub/sub transport between backend and frontend for status and update events.
