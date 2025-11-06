# Domain Event Design for Ping Counter

## Research Scope & Questions
- Define how the training service should model domain events for ping counter interactions, focusing on `PingCounterPinged` (read) and `PingCounterIncremented` (state change).
- Identify what to capture in the event payloads so adapters can forward signals to RabbitMQ/Kafka without obscuring domain intent.
- Clarify whether the existing `PingCounterEvent` snapshot class is sufficient or should evolve into a more explicit event abstraction.

## Internal Observations
- The service only raises events during `increment()`, publishing a `PingCounterEvent` with `before`/`after` snapshots and a timestamp (`src/domain/ping-counter/ping-counter.service.ts:35`, `src/domain/ping-counter/ping-counter.event.ts:3`).
- Reads (`get()`) return primitives without emitting side effects (`src/domain/ping-counter/ping-counter.service.ts:24`), so a `pinged` signal does not exist today.
- Domain classes do not track pending events; the aggregate mutates state directly (`src/domain/ping-counter/ping-counter.ts:6`), while infrastructure publishers simply forward serialized events downstream.

## External Insights
- Microsoft’s DDD guidance stresses that domain events make side effects explicit and usually flow synchronously inside the same bounded context, while integration events remain asynchronous [Microsoft Learn, 2025].
- Enterprise Craftsmanship warns against coupling events to persistence snapshots; payloads should expose only business-relevant data and avoid CRUD-style naming [Enterprise Craftsmanship, 2017].
- Arkency highlights naming rules: past-tense verbs, ubiquitous language, and contracts focused on state changes rather than entities’ full shape [Arkency, 2016].
- Microservices.io frames domain events as outputs of aggregates that update read models or drive sagas, implying events should arise from meaningful domain transitions, not incidental queries [Richardson, 2025].

## Design Options
- **Option A – Discriminated union events**: replace the snapshot class with a union such as `type PingCounterEvent = { type: 'PingCounterPinged'; aggregateId: string; occurredAt: Date } | { type: 'PingCounterIncremented'; aggregateId: string; count: number; occurredAt: Date; previousCount: number };`. Keeps payloads minimal and adapter-friendly, while letting the union grow with future events.
- **Option B – Base domain event class**: introduce a lightweight `PingCounterDomainEvent` base (id, aggregate id, occurredAt) and model `PingCounterIncremented`/`PingCounterPinged` as subclasses that describe their payload. Useful if training goals include inheritance or polymorphic dispatch, but adds boilerplate.
- **Option C – Split domain vs. telemetry**: treat `PingCounterIncremented` as the only true domain event and capture `pinged` as an application/analytics event outside the domain boundary. Simplifies the domain model but may undercut the exercise if learners must surface both scenarios through the same port.

## Recommended Direction
- Adopt Option A for clarity and training value: learners can see two explicit domain messages while still reasoning about payload trade-offs.
- Keep `PingCounterIncremented` as the canonical state-change event. Include minimal data (`aggregateId`, `count`, `previousCount`, `occurredAt`) so handlers can project trends without leaking infrastructure snapshots.
- Emit `PingCounterPinged` only if the curriculum needs to illustrate reads triggering domain-level reactions (e.g., audit trails). Otherwise, position it as an application event emitted by a separate telemetry publisher to avoid diluting the domain language.
- Create events inside the aggregate (`PingCounter.increment` could return the event or register it internally) so service classes orchestrate less and students observe hexagonal boundaries more clearly.

## Event Payload Guidelines
- Prefer identifiers and domain facts over object graphs; avoid serializing full primitives as currently done in `PingCounterEvent`.
- Use past-tense names that mirror the ubiquitous language (`PingCounterIncremented`, not `CounterUpdated`).
- Capture timing explicitly (`occurredAt`) and compute derived values (e.g., `previousCount`) in the aggregate to keep handlers deterministic.
- Consider publishing context metadata (request id, actor) via optional headers rather than the domain payload to retain separation of concerns.

## Implementation Considerations
- Updating `IPingCounterEventPublisher` to accept the new union type keeps adapters thin while enabling discriminated handling in tests (`src/domain/ping-counter/ping-counter.event-publisher.ts:3`).
- If both events must travel over RabbitMQ/Kafka, document routing keys/patterns so learners understand how type information appears on the wire.
- Ensure event creation happens before persistence so that the repository can participate in transactional outbox patterns later, as suggested by Microsoft Learn and microservices.io.
- Add lightweight unit tests showing each event being produced and published, reinforcing the “event as contract” concept without overwhelming learners.

## Follow-up Questions
- Should “pinged” be modeled as a domain event or reclassified as analytics telemetry outside the domain core?
- Do downstream consumers require the `before` snapshot, or can they derive trends from simple counters?
- Are there plans to add more ping counter state transitions (e.g., resets) that should influence the union now?
- What metadata (tenant, user, request correlation) must accompany events, and should it live in payloads or transport headers?

## References
- Microsoft Learn. *Domain events: Design and implementation* (accessed 2025-11-03).
- Vladimir Khorikov. *Domain events: simple and reliable solution* (Enterprise Craftsmanship, 2017).
- Andrzej Krzywda. *The anatomy of Domain Event* (Arkency Blog, 2016).
- Chris Richardson. *Pattern: Domain event* (microservices.io, 2025).
