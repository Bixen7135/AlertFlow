Architecture

System style

Modular monolith with separated runtime roles. One backend codebase, two runtime processes: API and Worker. Shared PostgreSQL and Redis. Containerized with Docker Compose.

No microservices. No external managed platforms. Clear boundaries between ingestion, domain logic, delivery, and presentation.

Core components

1. API Service

Runtime: Node.js with NestJS or Express.

Responsibilities:

* Public REST API for frontend
* Event feed with filtering and pagination
* Event detail endpoint
* Map data endpoint
* Admin endpoints for source control and manual event creation
* Telegram webhook endpoint
* Basic admin authentication

The API service is stateless. All persistence goes through PostgreSQL. Short lived caching goes through Redis.

2. Ingestion Worker

Separate container running the same codebase in worker mode.

Responsibilities:

* Scheduled polling of external sources
* Parsing and normalization into unified internal event model
* Deduplication and update detection
* Writing events and event updates to PostgreSQL
* Publishing notification jobs to Redis queue
* Logging ingestion status

Each source is processed independently to prevent cascading failure.

3. PostgreSQL

Single primary relational database.

Responsibilities:

* Persistent storage of events
* Persistent storage of event update history
* Storage of Telegram subscriptions
* Storage of ingestion logs and source status
* Support efficient queries for feed and map

Indexes are required on:

* Event type
* Start time
* Status
* Creation timestamp
* Geographic fields if used for map filtering

All deduplication constraints enforced at database level via unique fingerprint index.

4. Redis

Single Redis instance.

Responsibilities:

* Job queue for Telegram delivery
* Lightweight caching of feed queries with short TTL
* Distributed lock during ingestion batches if needed
* Temporary rate limiting counters for external API calls

Redis is not a primary data store. Loss of Redis does not corrupt core data.

5. Telegram Delivery Worker

Logical role that can run inside the ingestion worker or as a separate process.

Responsibilities:

* Consume notification jobs from Redis
* Resolve matching subscriptions
* Send messages via Telegram Bot API
* Log delivery success or failure
* Retry failed deliveries with capped retry policy

Queue based delivery prevents blocking ingestion or API threads.

6. Frontend

Next.js application.

Responsibilities:

* Feed page
* Event detail page
* Map view with event markers
* Filter UI for type and time
* Language switcher without automatic translation

Frontend communicates only with API service. No direct calls to third party APIs.

Data flow

Ingestion flow:

* Worker polls source
* Data normalized
* Deterministic fingerprint computed
* Insert or update in PostgreSQL
* If new or meaningfully changed, publish notification job to Redis

Delivery flow:

* Telegram worker consumes job
* Filters subscriptions by event type and optional district
* Sends message via Telegram API
* Logs result

Read flow:

* Frontend requests feed or map
* API queries PostgreSQL
* Optional Redis cache hit
* Response returned within SLA

Deduplication model

Each normalized event produces a deterministic fingerprint derived from stable business attributes. PostgreSQL enforces uniqueness on this fingerprint.

If fingerprint exists:

* Existing record updated
* Change history recorded
* Notification triggered only if relevant fields changed

If fingerprint does not exist:

* New event created
* Notification job created

This prevents duplicates while allowing controlled updates.

Failure isolation

* Each source processed in isolation
* Exceptions logged per source
* Failure of one source does not block others
* API continues functioning even if ingestion fails
* Redis failure affects delivery but not persistence

Rate limiting

* Worker enforces polling intervals per source
* Per source concurrency limits
* Optional Redis counters for API based rate tracking
* No direct external calls from frontend

Performance strategy

To satisfy two second first screen SLA:

* Indexed database queries
* Strict pagination limits
* Avoid heavy joins
* Cache most recent feed results in Redis for short duration
* Precompute minimal map payload
* Avoid synchronous external calls during API request

Docker topology

Single docker compose network with services:

* api
* worker
* postgres
* redis
* frontend

Shared internal network. Only API and frontend exposed externally.

Benefits

* Fast to implement
* Clear separation of responsibilities
* No vendor lock in
* Scalable path later by splitting services
* Operationally simple
