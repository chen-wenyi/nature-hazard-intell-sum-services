# Natural Hazard Intelligence Summary

A near real-time natural hazard intelligence platform that:

- Scrapes latest hazard content from MetService
- Stores outlooks and alerts in `MongoDB`
- Regenerates AI summaries when source data changes
- Pushes update events to the UI through `Ably` pub/sub

## Core Value
- Converts complex technical data into decision-ready intelligence
- Improves speed and clarity of emergency response planning
- Enables proactive risk management through timely AI-driven insights

## Architecture

The project has 3 main applications plus `MongoDB`:

- main-services: backend orchestration and scheduled jobs
- scrape-services: web scraping service for _MetService_ pages
- ui: frontend presentation layer
- mongodb: persistent storage

Main flow:

1. main-services runs cron jobs to refresh severe outlook, thunderstorm outlook, and issued alerts.
2. main-services fetches scraped content from scrape-services and CAP feed content from MetService.
3. If new content is detected, main-services stores it and regenerates summaries with OpenAI model gpt-5-mini.
4. main-services publishes update events through Ably.
5. ui subscribes to the Ably channel and refreshes the screen state.


<img width="2552" height="1590" alt="image" src="https://github.com/user-attachments/assets/0b35d8b7-b296-49e6-9d03-b13e42be5cf1" />


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

# Screenshots

## Natural Hazard Intelligence Dashboard
<img width="1909" height="923" alt="image" src="https://github.com/user-attachments/assets/5d5c01a8-c0d1-446b-b629-3c56bfb63f65" />

## Data Collection & Visualisation
<img width="1109" height="613" alt="image" src="https://github.com/user-attachments/assets/7236fd46-24dd-4fca-94bd-8948924891ae" />

## Issued Alterts Timeline feature
<img width="1288" height="1526" alt="image" src="https://github.com/user-attachments/assets/0d6f6fc5-11ac-483b-867e-9d0701c7f8c5" />

## Issued Alerts Status feature
<img width="1964" height="1394" alt="image" src="https://github.com/user-attachments/assets/b6008e48-3ca1-4c6e-af93-839c4ad1a37c" />

## Outlooks revision comparison feature
<img width="1278" height="541" alt="image" src="https://github.com/user-attachments/assets/b7895fd3-cd36-4122-ab44-e52806292fb8" />

## AI Generated content validation
<img width="3324" height="924" alt="image" src="https://github.com/user-attachments/assets/c14c1ac7-6dff-4d01-9f4e-604670efe9c9" />





