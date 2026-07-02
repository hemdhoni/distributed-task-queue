# Distributed Task Queue & Analytics System

## Overview

This project is a high-throughput backend service built with **Node.js**, **Express.js**, **MongoDB**, **Redis**, and **BullMQ**. It demonstrates asynchronous transaction processing, idempotent background workers, Redis caching, cache stampede protection, and graceful shutdown.

---

## Tech Stack

* Node.js (v18+)
* Express.js
* MongoDB (Mongoose)
* Redis
* BullMQ

---

## Features

* High-throughput transaction ingestion
* Rate limiting
* Background job processing with BullMQ
* Idempotent transaction processing
* MongoDB transaction for wallet deduction
* Retry mechanism with exponential backoff
* Analytics API
* Redis caching
* Cache stampede (Thundering Herd) protection
* Graceful shutdown using SIGINT/SIGTERM

---

## Project Structure

```text
.
├── src
│   ├── config
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── queues
│   ├── routes
│   ├── seed.js
│   └── app.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd distributed-task-queue
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/taskqueue

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

## Running the Project

### Start Redis

```bash
redis-server
```

### Start MongoDB

```bash
mongod
```

### Seed Sample Users

```bash
node src/seed.js
```

### Start the Server

```bash
npm run dev
```

---

## API Endpoints

### Create Transaction

**POST** `/v1/transactions`

Request Body

```json
{
  "id": "TXN001",
  "userId": "user1",
  "amount": 500,
  "currency": "INR",
  "timestamp": "2026-07-02T17:00:00Z"
}
```

Response

```json
{
  "success": true,
  "message": "Transaction queued successfully"
}
```

---

### Analytics Summary

**GET** `/v1/analytics/summary`

Sample Response

```json
{
  "totalProcessedVolume": 1500,
  "topUsers": [
    {
      "_id": "user1",
      "volume": 1000
    },
    {
      "_id": "user2",
      "volume": 500
    }
  ]
}
```

---

## Architecture

```text
                Client
                   │
                   ▼
        POST /v1/transactions
                   │
          Rate Limiter
                   │
             BullMQ Queue
                   │
                Redis
                   │
                   ▼
          Background Worker
                   │
      Simulate 500ms Delay
                   │
      MongoDB Transaction
      ├── Check Idempotency
      ├── Deduct Wallet Balance
      └── Save Transaction
```

---

## Idempotent Processing

Each transaction contains a unique `transactionId`.

Before processing a job, the worker checks whether a transaction with the same ID already exists. If it does, the worker skips processing to ensure that duplicate transactions are not processed more than once.

---

## Retry Strategy

BullMQ is configured with:

* Maximum 3 retry attempts
* Exponential backoff

If processing fails due to a temporary error, BullMQ automatically retries the job.

---

## Analytics Caching

The analytics endpoint simulates a slow database query by introducing a 2-second delay.

To improve performance, the computed analytics are cached in Redis. Once cached, subsequent requests are served directly from Redis, reducing response time to well under 50 ms.

---

## Cache Stampede Protection

To prevent multiple concurrent requests from triggering expensive database queries after the cache expires, the application uses a Redis lock.

1. The first request acquires a Redis lock (`SET NX`).
2. Only that request performs the database query.
3. Other concurrent requests wait until the cache is populated.
4. Once the first request stores the result in Redis, waiting requests return the cached data instead of querying the database.

This ensures that only one database query executes during cache regeneration, preventing the **Thundering Herd** problem.

---

## Graceful Shutdown

The application handles `SIGINT` and `SIGTERM` signals.

During shutdown it:

* Stops accepting new HTTP requests.
* Waits for the worker to finish processing active jobs.
* Closes MongoDB connections.
* Closes Redis connections.
* Exits cleanly without losing queued jobs.

---

## Future Improvements

* Request validation using Joi or express-validator.
* Structured logging.
* Docker Compose for one-command setup.
* Unit and integration tests.
* Cache invalidation after successful transaction processing.
* Monitoring and metrics.

---

## License

This project was created as part of a backend machine test and is intended for demonstration purposes.
