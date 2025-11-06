# NestJS Decorator Metadata Keys Investigation

## Research Date
2025-11-01

## Objective
Deep investigation into actual metadata keys set by `@Resolver` and `@Controller` decorators in NestJS by examining source code and runtime behavior.

## Source Code Analysis

### @Controller Decorator

**Location:** `@nestjs/common/decorators/core/controller.decorator.ts`

**Metadata Keys Set:**
1. `CONTROLLER_WATERMARK` = `'__controller__'` (value: `true`)
2. `PATH_METADATA` = `'path'` (value: string | string[])
3. `HOST_METADATA` = `'host'` (value: string | RegExp | Array<string | RegExp> | undefined)
4. `SCOPE_OPTIONS_METADATA` = `'scope:options'` (value: ScopeOptions | undefined)
5. `VERSION_METADATA` = `'__version__'` (value: string | string[] | Symbol | undefined)

**Source Code:**
```typescript
export function Controller(
  prefixOrOptions?: string | string[] | ControllerOptions,
): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, target);
    Reflect.defineMetadata(PATH_METADATA, path, target);
    Reflect.defineMetadata(HOST_METADATA, host, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, scopeOptions, target);
    Reflect.defineMetadata(VERSION_METADATA, versionOptions, target);
  };
}
```

**Constants Location:** `@nestjs/common/constants.ts`

### @Resolver Decorator

**Location:** `@nestjs/graphql/lib/decorators/resolver.decorator.ts`

**Metadata Keys Set:**
1. `ENTRY_PROVIDER_WATERMARK` = `'__entryProvider__'` (value: `true`) - from @nestjs/common
2. `RESOLVER_TYPE_METADATA` = `'graphql:resolver_type'` (value: Resolver enum | string | undefined)
3. `RESOLVER_NAME_METADATA` = `'graphql:resolver_name'` (value: string | undefined)

**Source Code:**
```typescript
export function Resolver(
  nameOrTypeOrOptions?: string | ResolverTypeFn | Type<any> | Function | ResolverOptions,
  options?: ResolverOptions,
): MethodDecorator & ClassDecorator {
  return (target: object | Function, key?: string | symbol, descriptor?: any) => {
    if (typeof target === 'function') {
      SetMetadata(ENTRY_PROVIDER_WATERMARK, true)(target);
    }

    addResolverMetadata(undefined, name, target, key, descriptor);
    // ... additional logic
  };
}
```

**Helper Function:**
```typescript
export function addResolverMetadata(
  resolver: Resolver | string | undefined,
  name: string | undefined,
  target?: Record<string, any> | Function,
  key?: string | symbol,
  descriptor?: any,
) {
  SetMetadata(RESOLVER_TYPE_METADATA, resolver || name)(target, key, descriptor);
  SetMetadata(RESOLVER_NAME_METADATA, name)(target, key, descriptor);
}
```

**Constants Location:** `@nestjs/graphql/lib/graphql.constants.ts`

## Runtime Verification

**Test Code:**
```typescript
import 'reflect-metadata';
import { Controller } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

@Controller('test')
class TestController {}

@Resolver()
class TestResolver {}

console.log('Controller Keys:', Reflect.getMetadataKeys(TestController));
console.log('Resolver Keys:', Reflect.getMetadataKeys(TestResolver));
```

**Actual Results:**

### @Controller Metadata Keys
```
[
  '__controller__',      // CONTROLLER_WATERMARK
  'path',               // PATH_METADATA
  'host',               // HOST_METADATA
  'scope:options',      // SCOPE_OPTIONS_METADATA
  '__version__'         // VERSION_METADATA
]
```

Values:
- `__controller__: true`
- `path: 'test'`
- `host: undefined`
- `scope:options: undefined`
- `__version__: undefined`

### @Resolver Metadata Keys
```
[
  '__entryProvider__',        // ENTRY_PROVIDER_WATERMARK
  'graphql:resolver_type',    // RESOLVER_TYPE_METADATA
  'graphql:resolver_name'     // RESOLVER_NAME_METADATA
]
```

Values:
- `__entryProvider__: true`
- `graphql:resolver_type: undefined`
- `graphql:resolver_name: undefined`

## Complete Metadata Key Constants

### @nestjs/common Constants
```typescript
export const CONTROLLER_WATERMARK = '__controller__';
export const PATH_METADATA = 'path';
export const HOST_METADATA = 'host';
export const SCOPE_OPTIONS_METADATA = 'scope:options';
export const VERSION_METADATA = '__version__';
export const ENTRY_PROVIDER_WATERMARK = '__entryProvider__';
```

### @nestjs/graphql Constants
```typescript
export const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
export const RESOLVER_NAME_METADATA = 'graphql:resolver_name';
export const RESOLVER_PROPERTY_METADATA = 'graphql:resolve_property';
export const FIELD_RESOLVER_MIDDLEWARE_METADATA = 'graphql:field_resolver_middleware';
export const RESOLVER_DELEGATE_METADATA = 'graphql:delegate_property';
export const RESOLVER_REFERENCE_METADATA = 'graphql:resolve_reference';
```

## Reliable Detection Code

### Check if Class is Controller
```typescript
import { CONTROLLER_WATERMARK } from '@nestjs/common/constants';

function isController(target: Function): boolean {
  return Reflect.getMetadata(CONTROLLER_WATERMARK, target) === true;
}
```

### Check if Class is Resolver
```typescript
import { ENTRY_PROVIDER_WATERMARK } from '@nestjs/common/constants';
import { RESOLVER_TYPE_METADATA } from '@nestjs/graphql/lib/graphql.constants';

function isResolver(target: Function): boolean {
  // Primary check: has graphql:resolver_type metadata
  const hasResolverType = Reflect.hasMetadata(RESOLVER_TYPE_METADATA, target);

  // Secondary check: is entry provider (shared with other decorators)
  const isEntryProvider = Reflect.getMetadata(ENTRY_PROVIDER_WATERMARK, target) === true;

  // Reliable detection: both conditions
  return hasResolverType && isEntryProvider;
}
```

### Alternative: Check for Specific Keys
```typescript
function isController(target: Function): boolean {
  const keys = Reflect.getMetadataKeys(target);
  return keys.includes('__controller__');
}

function isResolver(target: Function): boolean {
  const keys = Reflect.getMetadataKeys(target);
  return keys.includes('graphql:resolver_type') ||
         keys.includes('graphql:resolver_name');
}
```

### Fallback: Check Multiple Keys
```typescript
function detectDecoratorType(target: Function): 'controller' | 'resolver' | 'unknown' {
  const keys = new Set(Reflect.getMetadataKeys(target));

  // Check for controller
  if (keys.has('__controller__')) {
    return 'controller';
  }

  // Check for resolver (multiple possible keys)
  if (keys.has('graphql:resolver_type') ||
      keys.has('graphql:resolver_name')) {
    return 'resolver';
  }

  return 'unknown';
}
```

## Key Findings

1. **Primary Watermark Keys:**
   - Controllers: `__controller__` (CONTROLLER_WATERMARK)
   - Resolvers: `__entryProvider__` (ENTRY_PROVIDER_WATERMARK) + GraphQL-specific keys

2. **GraphQL-Specific Keys:**
   - `graphql:resolver_type` - ALWAYS set by @Resolver (even if undefined)
   - `graphql:resolver_name` - ALWAYS set by @Resolver (even if undefined)

3. **Verification Keys:**
   - Use `'graphql:resolver_type'` to check for @Resolver - this is CORRECT
   - Use `'path'` for @Controller is INCORRECT - should use `'__controller__'`

4. **Recommended Detection:**
   ```typescript
   // Most reliable for Controller
   Reflect.getMetadata('__controller__', target) === true

   // Most reliable for Resolver
   Reflect.hasMetadata('graphql:resolver_type', target)
   ```

5. **Alternative Keys:**
   - For @Resolver: Can also check `__entryProvider__` + `graphql:resolver_name`
   - For @Controller: Can check for `path` existence, but `__controller__` is more explicit

## All GraphQL Constants Reference

```typescript
// Resolver metadata
export const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
export const RESOLVER_NAME_METADATA = 'graphql:resolver_name';
export const RESOLVER_PROPERTY_METADATA = 'graphql:resolve_property';
export const FIELD_RESOLVER_MIDDLEWARE_METADATA = 'graphql:field_resolver_middleware';
export const RESOLVER_DELEGATE_METADATA = 'graphql:delegate_property';
export const RESOLVER_REFERENCE_METADATA = 'graphql:resolve_reference';

// Field metadata
export const SCALAR_NAME_METADATA = 'graphql:scalar_name';
export const SCALAR_TYPE_METADATA = 'graphql:scalar_type';
export const CLASS_TYPE_METADATA = 'graphql:class_type';

// Subscription metadata
export const SUBSCRIPTION_OPTIONS_METADATA = 'graphql:subscription_options;';

// Special keys
export const PARAM_ARGS_METADATA = '__routeArguments__';
export const RESOLVER_REFERENCE_KEY = '__resolveReference';
export const FIELD_TYPENAME = '__resolveType';
```

## Conclusions

1. **`'graphql:resolver_type'` is CORRECT** for detecting @Resolver decorators
2. **`'path'` is INCORRECT** for detecting @Controller - use `'__controller__'` instead
3. Both decorators set multiple metadata keys, but each has a unique watermark
4. The values may be undefined, so check for key existence rather than value
5. `ENTRY_PROVIDER_WATERMARK` is shared between @Resolver and potentially other decorators
6. Always prefer watermark constants over functional metadata (path, host, etc.)
