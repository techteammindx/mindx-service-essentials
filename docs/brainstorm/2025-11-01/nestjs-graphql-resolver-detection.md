# NestJS GraphQL Resolver Detection Research

**Date**: 2025-11-01
**Scope**: Runtime detection of GraphQL resolver classes in NestJS

## Problem

The initial detection approach using `'graphql:resolver'` as metadata key returned `undefined`. The actual metadata keys used by `@Resolver()` decorator needed to be identified.

## Findings

### 1. Actual Metadata Keys

Located in `/node_modules/@nestjs/graphql/dist/graphql.constants.js`:

```typescript
RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
RESOLVER_NAME_METADATA = 'graphql:resolver_name';
RESOLVER_PROPERTY_METADATA = 'graphql:resolve_property';
```

### 2. How @Resolver() Decorator Works

Source: `/node_modules/@nestjs/graphql/dist/decorators/resolver.decorator.js`

The decorator sets TWO metadata keys on the class:
- `graphql:resolver_type` - Contains resolver type or name
- `graphql:resolver_name` - Contains the resolved entity name

Implementation in `resolvers.utils.js`:
```javascript
function addResolverMetadata(resolver, name, target, key, descriptor) {
    SetMetadata(RESOLVER_TYPE_METADATA, resolver || name)(target, key, descriptor);
    SetMetadata(RESOLVER_NAME_METADATA, name)(target, key, descriptor);
}
```

### 3. Detection Methods

#### Method 1: Check RESOLVER_TYPE_METADATA (Primary)
```typescript
import { Reflector } from '@nestjs/core';

const reflector = new Reflector();
const isResolver = reflector.get('graphql:resolver_type', TargetClass) !== undefined;
```

#### Method 2: Check RESOLVER_NAME_METADATA (Alternative)
```typescript
const resolverName = reflector.get('graphql:resolver_name', TargetClass);
const isResolver = resolverName !== undefined;
```

#### Method 3: Check for @Query/@Mutation decorators on methods
```typescript
function hasGraphQLMethods(target: any): boolean {
  const prototype = target.prototype;
  const methodNames = Object.getOwnPropertyNames(prototype).filter(
    name => name !== 'constructor' && typeof prototype[name] === 'function'
  );

  return methodNames.some(methodName => {
    const resolverType = Reflect.getMetadata('graphql:resolver_type', prototype, methodName);
    return resolverType === 'Query' || resolverType === 'Mutation' || resolverType === 'Subscription';
  });
}
```

#### Method 4: Use NestJS Common ENTRY_PROVIDER_WATERMARK
Source: `/node_modules/@nestjs/graphql/dist/decorators/resolver.decorator.js:37`

```typescript
import { ENTRY_PROVIDER_WATERMARK } from '@nestjs/common/constants';

const isEntryProvider = reflector.get(ENTRY_PROVIDER_WATERMARK, TargetClass) === true;
// Note: This marks the class as a provider entry point, not GraphQL-specific
```

### 4. Working Code Example

```typescript
import { Reflector } from '@nestjs/core';

export class GraphQLResolverDetector {
  private readonly reflector = new Reflector();

  /**
   * Detects if a class is a GraphQL resolver using metadata keys
   */
  isGraphQLResolver(target: any): boolean {
    // Primary check: resolver type metadata
    const resolverType = this.reflector.get('graphql:resolver_type', target);
    if (resolverType !== undefined) {
      return true;
    }

    // Secondary check: resolver name metadata
    const resolverName = this.reflector.get('graphql:resolver_name', target);
    if (resolverName !== undefined) {
      return true;
    }

    // Fallback: check for @Query/@Mutation/@Subscription methods
    return this.hasGraphQLMethods(target);
  }

  /**
   * Gets the resolver name if available
   */
  getResolverName(target: any): string | undefined {
    return this.reflector.get('graphql:resolver_name', target);
  }

  /**
   * Checks if any method has GraphQL decorators
   */
  private hasGraphQLMethods(target: any): boolean {
    const prototype = target.prototype;
    if (!prototype) return false;

    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      name => name !== 'constructor' && typeof prototype[name] === 'function'
    );

    return methodNames.some(methodName => {
      const resolverType = Reflect.getMetadata('graphql:resolver_type', prototype, methodName);
      return resolverType === 'Query' || resolverType === 'Mutation' || resolverType === 'Subscription';
    });
  }
}

// Usage example
const detector = new GraphQLResolverDetector();
const isResolver = detector.isGraphQLResolver(PingCounterResolver); // true
const name = detector.getResolverName(PingCounterResolver); // undefined (no specific type)
```

## Recommendations

### Approach 1: Simple Metadata Check (Recommended for Most Cases)
Use `graphql:resolver_type` as primary detection mechanism. Clean, direct, leverages official metadata.

```typescript
const isResolver = reflector.get('graphql:resolver_type', TargetClass) !== undefined;
```

### Approach 2: Method-Level Scanning (Robust Fallback)
Check methods for `@Query`/`@Mutation` decorators when class-level metadata absent. Useful for edge cases or partial resolver classes.

```typescript
const hasGraphQLMethods = methodNames.some(m =>
  Reflect.getMetadata('graphql:resolver_type', prototype, m) !== undefined
);
```

### Approach 3: Combined Strategy (Maximum Reliability)
Implement both checks in sequence: class-level first, method-level fallback. Ensures detection across all decorator patterns.

```typescript
return resolverType !== undefined || this.hasGraphQLMethods(target);
```

## Technical Considerations

1. **Class vs Method Metadata**: `@Resolver()` sets class-level metadata; `@Query`/`@Mutation` set method-level metadata
2. **Metadata Availability**: Metadata only available after decorators execute, ensure detection runs post-instantiation
3. **Reflector vs Reflect.getMetadata**: NestJS Reflector provides cleaner API, direct Reflect.getMetadata works for lower-level access
4. **Performance**: Class-level check faster than method scanning; use method scanning only as fallback

## Alternative Approaches Considered

### TypeMetadataStorage (Internal API)
```typescript
import { TypeMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage';
const metadata = TypeMetadataStorage.getResolverMetadata(target);
```
**Not recommended**: Internal API, subject to breaking changes, not part of public contract.

### Controller Pattern Detection
Check for `ENTRY_PROVIDER_WATERMARK` from `@nestjs/common/constants`.
**Not recommended**: Too generic, marks all providers including non-GraphQL classes.

## Clarifying Questions

1. What's the use case for resolver detection? (Dynamic module registration, documentation generation, testing utilities?)
2. Should detection run at bootstrap time or runtime?
3. Need to detect method-level resolver fields (`@ResolveField`) separately?
4. Performance constraints? Scanning all methods vs class-only metadata check?

## References

- `/node_modules/@nestjs/graphql/dist/graphql.constants.js` - Metadata key definitions
- `/node_modules/@nestjs/graphql/dist/decorators/resolver.decorator.js` - Decorator implementation
- `/node_modules/@nestjs/graphql/dist/decorators/resolvers.utils.js` - Metadata utilities
- `/node_modules/@nestjs/graphql/dist/decorators/query.decorator.js` - Query decorator implementation
- `/node_modules/@nestjs/graphql/dist/decorators/mutation.decorator.js` - Mutation decorator implementation
