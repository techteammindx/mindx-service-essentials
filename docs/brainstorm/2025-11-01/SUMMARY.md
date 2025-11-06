# NestJS Decorator Metadata Investigation Summary

## Quick Reference

### @Controller Metadata Keys (ALL)
```typescript
'__controller__'   // Primary watermark - ALWAYS true
'path'            // Route path
'host'            // Host filter
'scope:options'   // Injection scope
'__version__'     // API version
```

### @Resolver Metadata Keys (ALL)
```typescript
'__entryProvider__'       // Entry provider marker - ALWAYS true
'graphql:resolver_type'   // Resolver type (may be undefined)
'graphql:resolver_name'   // Resolver name (may be undefined)
```

## Best Detection Methods

### Controller Detection
```typescript
// Method 1: Using watermark (BEST)
Reflect.getMetadata('__controller__', target) === true

// Method 2: Using constant
import { CONTROLLER_WATERMARK } from '@nestjs/common/constants';
Reflect.getMetadata(CONTROLLER_WATERMARK, target) === true

// Method 3: Check key existence
Reflect.getMetadataKeys(target).includes('__controller__')
```

### Resolver Detection
```typescript
// Method 1: Check GraphQL metadata (BEST)
Reflect.hasMetadata('graphql:resolver_type', target)

// Method 2: Using constant
import { RESOLVER_TYPE_METADATA } from '@nestjs/graphql/lib/graphql.constants';
Reflect.hasMetadata(RESOLVER_TYPE_METADATA, target)

// Method 3: Check key existence
const keys = Reflect.getMetadataKeys(target);
keys.includes('graphql:resolver_type') || keys.includes('graphql:resolver_name')
```

## Verified Facts

1. ✅ `'graphql:resolver_type'` is CORRECT for @Resolver detection
2. ❌ `'path'` is WRONG for @Controller detection (use `'__controller__'`)
3. ✅ Both decorators set multiple keys, values may be undefined
4. ✅ Use `Reflect.hasMetadata()` or check key existence, not values
5. ✅ Each decorator has unique watermark keys for reliable detection

## Source Locations

- **@Controller:** `@nestjs/common/decorators/core/controller.decorator.ts`
- **@Resolver:** `@nestjs/graphql/lib/decorators/resolver.decorator.ts`
- **Common Constants:** `@nestjs/common/constants.ts`
- **GraphQL Constants:** `@nestjs/graphql/lib/graphql.constants.ts`

## Full Documentation

See `nestjs-decorator-metadata-keys.md` for complete source code analysis and all metadata constants.
