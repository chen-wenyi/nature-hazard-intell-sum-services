# Natural Hazard Intelligence Summary

## Prerequisite

- Docker Engine
- Install guide: https://docs.docker.com/engine/install/

## Environment Setup

1. Copy all variables from .env.schema into .env:

```bash
cp .env.schema .env
```

2. Open .env and set required secrets:

```env
OPENAI_API_KEY=your_openai_api_key_here
ABLY_API_KEY=your_ably_api_key_here
```

3. Create an Ably account and get your API key:

- Sign up: https://ably.com/
- Create an app in Ably dashboard
- Create an API key and set it in ABLY_API_KEY

4. If deploying on cloud, set environment variables in your cloud provider environment variable settings instead of committing secrets in files.

## Start

Run from the project root:

```bash
docker compose up --build
```

## Access

- Local: visit http://localhost:3001
- Cloud: bind a DNS/domain name to your deployed service and access via that domain

## Shut Down

Run from the project root:

```bash
docker compose down
```
