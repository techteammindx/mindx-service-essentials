# Runtime Decorator Detection Research: GraphQL Resolvers vs Controllers in NestJS

**Research Date:** 2025-11-01
**Context:** Educational training project investigating runtime decorator detection patterns for distinguishing GraphQL Resolvers from Controllers

## Research Question

How to detect at runtime whether a class has `@Resolver` (GraphQL) vs `@Controller` decorator in NestJS, and whether classes with different decorators can be bundled into a single array then split later by checking decorator presence.

## Codebase Context

**Current Implementation:**
- `/home/huynq/mindx-atlas/training/mindx-service-essentials/src/transport/graphql/ping-counter.resolver.ts` - Uses `@Resolver()` from `@nestjs/graphql`
- `/home/huynq/mindx-atlas/training/mindx-service-essentials/src/transport/grpc/ping-counter.controller.ts` - Uses `@Controller()` from `@nestjs/common`

Both classes serve similar application-layer services but through different transport mechanisms (GraphQL vs gRPC).

## Key Findings

### 1. Metadata Keys for Decorator Detection

**@Controller Decorator:**
- **Metadata Key:** `CONTROLLER_WATERMARK` (from `@nestjs/common/constants`)
- **Additional Keys:** `PATH_METADATA`, `HOST_METADATA`, `SCOPE_OPTIONS_METADATA`, `VERSION_METADATA`
- **Source:** `packages/common/decorators/core/controller.decorator.ts`
- **Detection Pattern:** `Reflect.getMetadata('path', ClassConstructor)` or check watermark

**@Resolver Decorator:**
- **Metadata Key:** `RESOLVER_NAME_METADATA` (from `@nestjs/graphql/graphql.constants`)
- **Additional Keys:** `RESOLVER_PROPERTY_METADATA`, `FIELD_RESOLVER_MIDDLEWARE_METADATA`
- **Source:** `packages/graphql/lib/decorators/resolve-field.decorator.ts`
- **Detection Pattern:** GraphQL module uses reflection to introspect metadata from decorators

### 2. Runtime Detection Approach

**Using Reflect API:**
```typescript
import 'reflect-metadata';

// Check if class is a Controller
function isController(target: any): boolean {
  return Reflect.getMetadata('path', target) !== undefined;
}

// Check if class is a Resolver (requires @nestjs/graphql constants)
function isResolver(target: any): boolean {
  // GraphQL resolver detection is more complex
  // Typically check for resolver metadata or specific GraphQL markers
  return Reflect.getMetadata('graphql:resolver_type', target) !== undefined;
}
```

**Using NestJS Reflector:**
```typescript
import { Reflector } from '@nestjs/core';

const reflector = new Reflector();

// In a guard or interceptor with ExecutionContext
const isControllerClass = reflector.get('path', context.getClass()) !== undefined;
```

### 3. Bundling and Splitting Viability

**Can Bundle:** YES with caveats
- Both Controllers and Resolvers are injectable classes
- Can be placed in same array: `const transportClasses = [ControllerA, ResolverB, ControllerC]`
- Both support dependency injection and NestJS provider patterns

**Splitting Pattern:**
```typescript
function splitByDecoratorType(classes: any[]) {
  const controllers: any[] = [];
  const resolvers: any[] = [];

  for (const cls of classes) {
    // Check PATH_METADATA for controllers
    if (Reflect.getMetadata('path', cls) !== undefined) {
      controllers.push(cls);
    }
    // Check for GraphQL resolver markers
    else if (hasResolverMetadata(cls)) {
      resolvers.push(cls);
    }
  }

  return { controllers, resolvers };
}

function hasResolverMetadata(target: any): boolean {
  // GraphQL decorators set specific metadata
  // May need to check multiple keys depending on decorator usage
  return Reflect.getMetadata('graphql:resolver_type', target) !== undefined ||
         Reflect.getMetadata('graphql:resolver', target) !== undefined;
}
```

### 4. Limitations and Gotchas

**Metadata Availability:**
- Requires `emitDecoratorMetadata: true` in `tsconfig.json`
- Requires `reflect-metadata` package imported before usage
- Metadata only exists after decorator application (compile-time → runtime)

**Decorator Internals:**
- `@Controller()` uses `PATH_METADATA` even with empty string: `@Controller()` sets `path = ''`
- `@Resolver()` metadata structure differs between code-first and schema-first approaches
- Not all classes with `@Injectable()` are Controllers or Resolvers

**Detection Ambiguity:**
- A class could theoretically have both decorators (anti-pattern but technically possible)
- Classes without decorators won't have metadata keys
- Metadata keys are internal NestJS implementation details subject to change

**Module Registration:**
- NestJS registers Controllers via `controllers` array in `@Module()`
- NestJS registers Resolvers via `providers` array (they're providers, not controllers)
- This architectural difference suggests they shouldn't be bundled at module level

### 5. Code Examples from Research

**Official @Controller Implementation:**
```typescript
// From nestjs/nest source
export function Controller(path?: string): ClassDecorator {
  const defaultPath = '/';
  const [controllerPath, host, scopeOptions, versionOptions] =
    isUndefined(path) ? [defaultPath, undefined, undefined, undefined] :
    [path, options?.host, options?.scope, options?.version];

  return (target: object) => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, target);
    Reflect.defineMetadata(PATH_METADATA, controllerPath, target);
    // ... additional metadata
  };
}
```

**Metadata Reading Pattern:**
```typescript
// Using Reflector in Guards/Interceptors
@Injectable()
export class TypeDetectionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get class metadata
    const handler = context.getHandler();
    const controllerClass = context.getClass();

    // Check for controller metadata
    const path = this.reflector.get('path', controllerClass);
    const isController = path !== undefined;

    console.log(`Is Controller: ${isController}`);
    return true;
  }
}
```

### 6. Alternative Approaches

**Use NestJS DiscoveryService:**
```typescript
import { DiscoveryService } from '@nestjs/core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransportDiscovery {
  constructor(private discovery: DiscoveryService) {}

  findAllControllers() {
    return this.discovery.getControllers();
  }

  findAllProviders() {
    // Resolvers are providers
    return this.discovery.getProviders();
  }
}
```

**Use Module-Level Separation (Recommended):**
Rather than bundle and split, register separately:
```typescript
@Module({
  controllers: [PingCounterGrpcController], // Controllers here
  providers: [PingCounterResolver, AppService], // Resolvers here
})
export class AppModule {}
```

## Recommendations for Educational Pattern

### Most Clear Learning Pattern: **Separate Registration**

**Why:**
1. Matches NestJS architectural intent (Controllers vs Providers)
2. Type-safe at compile time
3. No reflection API complexity needed
4. Clear separation of concerns visible in module definition

**Implementation:**
```typescript
// Recommended approach
const httpControllers = [PingCounterGrpcController];
const graphqlResolvers = [PingCounterResolver];

@Module({
  controllers: httpControllers,
  providers: [...graphqlResolvers, AppService],
})
```

### Alternative Pattern: **Runtime Detection** (Educational Only)

**Use Cases:**
- Teaching reflection and metadata concepts
- Dynamic module configuration scenarios
- Advanced metaprogramming demonstrations

**Implementation:**
```typescript
// Educational pattern showing reflection
function detectTransportType(target: any): 'controller' | 'resolver' | 'unknown' {
  if (Reflect.getMetadata('path', target) !== undefined) {
    return 'controller';
  }
  // GraphQL resolver check (simplified)
  if (Reflect.getMetadata('graphql:resolver_type', target)) {
    return 'resolver';
  }
  return 'unknown';
}

// Usage
const allTransports = [PingCounterGrpcController, PingCounterResolver];
const grouped = allTransports.reduce((acc, cls) => {
  const type = detectTransportType(cls);
  if (type === 'controller') acc.controllers.push(cls);
  if (type === 'resolver') acc.resolvers.push(cls);
  return acc;
}, { controllers: [], resolvers: [] });
```

## Technical Constraints

1. **reflect-metadata Dependency:** Must be imported at application entry point
2. **Compiler Config:** Requires `emitDecoratorMetadata: true` and `experimentalDecorators: true`
3. **Metadata Keys:** Internal implementation details, not public API surface
4. **Type Safety:** Runtime detection loses compile-time type checking benefits

## Clarifying Questions

1. **Use Case Context:** Is this for dynamic module registration or teaching reflection concepts?
2. **Bundle Reason:** What drives the need to bundle different transport types together?
3. **Detection Timing:** Does detection need to happen at startup or per-request?
4. **Scope:** Should this work with custom decorators or only built-in NestJS decorators?

## References

### Codebase
- `/home/huynq/mindx-atlas/training/mindx-service-essentials/src/transport/graphql/ping-counter.resolver.ts`
- `/home/huynq/mindx-atlas/training/mindx-service-essentials/src/transport/grpc/ping-counter.controller.ts`

### External Sources
- NestJS Metadata Deep Dive - Trilon Consulting: https://trilon.io/blog/nestjs-metadata-deep-dive
- NestJS Source: `packages/common/decorators/core/controller.decorator.ts`
- NestJS GraphQL Source: `packages/graphql/lib/decorators/resolve-field.decorator.ts`
- Stack Overflow: "How to scan all decorators value at runtime in nestjs"
- NestJS Docs: Custom Decorators and Reflection

### Key Concepts
- `Reflect.getMetadata(key, target)` - Core metadata reading API
- `CONTROLLER_WATERMARK` - Internal marker for controllers
- `PATH_METADATA` - Route path stored by @Controller
- `RESOLVER_NAME_METADATA` - GraphQL resolver identification
- `design:paramtypes` - Constructor parameter type metadata
- `DiscoveryService` - NestJS utility for discovering providers/controllers
- `Reflector` - NestJS helper for accessing metadata in execution context

## Conclusion

**Viable:** Yes, bundling and splitting is technically possible using reflection metadata.

**Recommended:** No, for educational clarity prefer explicit separation at module registration level.

**Best for Learning:** Demonstrate both patterns - show "why separation is clearer" by first attempting detection complexity, then refactoring to simple separation.

**Gotchas Summary:**
- Metadata keys are internal implementation details
- Requires careful reflection API usage
- Type safety loss at runtime
- GraphQL resolver metadata structure varies by approach (code-first vs schema-first)
- Controllers and Resolvers have different registration mechanisms in modules
