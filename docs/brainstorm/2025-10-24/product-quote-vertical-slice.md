## CRM Product & Quote Vertical Slice Brainstorm (2025-10-24)

### Objectives
- Showcase a thin vertical slice spanning domain, application, and infrastructure layers.
- Keep business logic accessible while reflecting enterprise CRM realities.
- Provide educational contrast between product catalog management and quote pricing flow.

### Scope Decisions
- **Domain focus**: Product aggregate for catalog maintenance; Quote aggregate for pricing and recalculation.
- **Operations**: Product create, product read/filter; Quote create, quote add-product mutation, quote read.
- **Boundaries**: Single unit per quote line, per-item price only, no tax handling.
- **Events**: Quote emits `QuoteTotalsRecalculated` after each mutation to trigger downstream listeners immediately.

### Product Slice Notes
- Aggregate encapsulates SKU, name, category, base price, availability flag.
- Validation ensures unique SKU, non-empty name, non-negative price.
- Repository supports category filter and case-insensitive name search for list queries.
- GraphQL/API layer exposes createProduct mutation and listProducts query with category/name filters.

### Quote Slice Notes
- Aggregate tracks customer reference, status, and collection of line items.
- Line item holds productId, captured unit price, and derived line total.
- Adding a product validates product existence via Product domain service or repository lookup.
- Recalculation pipeline: sum line totals → update aggregate subtotal → emit domain event.
- Application layer mutation handles command, invokes aggregate method, persists via repository, publishes event for infrastructure listener (e.g., notification/log).

### Cross-Cutting Considerations
- Use case classes per action: `CreateProduct`, `ListProducts`, `CreateQuote`, `AddProductToQuote`, `GetQuote`.
- Shared value objects: Money (currency + amount), LineItemId for uniqueness.
- Infrastructure adapters: Postgres repositories (TypeORM or Prisma), event bus stub (in-memory or Kafka-lite) to illustrate event propagation.
- Authorization kept minimal (e.g., role check) to avoid distracting from DDD focus.
- Adapter swap storyline: demonstrate Postgres-backed Product repository first, then replace with MongoDB adapter before introducing Quote persistence.
- Interface parity: keep all transport examples centered on GraphQL while demonstrating how the same use cases project through different GraphQL clients (admin vs. sales workspace).

### Open Questions
- Do we capture product snapshot (name, price) on quote lines to preserve historical context?
- What downstream handler best demonstrates event usage—logging, webhook trigger, or pricing audit trail?

### Key Insights & Decisions (2025-10-25)
- gRPC resolver layer will be consumed by another internal service, so transport-level identity or permission metadata is unnecessary.
- Testing strategy for the transport swap will be defined later once implementation details stabilize.
- `QuoteTotalsRecalculated` remains Kafka-only; gRPC exposure is intentionally out of scope.
