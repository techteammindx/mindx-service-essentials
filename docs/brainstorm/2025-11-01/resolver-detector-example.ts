/**
 * Working Example: GraphQL Resolver Detection in NestJS
 *
 * This demonstrates the correct way to detect GraphQL resolvers at runtime
 * using the actual metadata keys set by @nestjs/graphql decorators.
 */

import { Reflector } from '@nestjs/core';

// Constants from @nestjs/graphql/dist/graphql.constants
const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
const RESOLVER_NAME_METADATA = 'graphql:resolver_name';

export class GraphQLResolverDetector {
  private readonly reflector = new Reflector();

  /**
   * Primary detection method - checks class-level metadata
   */
  isGraphQLResolver(target: any): boolean {
    // Check resolver type metadata (set by @Resolver decorator)
    const resolverType = this.reflector.get(RESOLVER_TYPE_METADATA, target);
    if (resolverType !== undefined) {
      return true;
    }

    // Check resolver name metadata (also set by @Resolver)
    const resolverName = this.reflector.get(RESOLVER_NAME_METADATA, target);
    if (resolverName !== undefined) {
      return true;
    }

    // Fallback: scan methods for @Query/@Mutation/@Subscription
    return this.hasGraphQLMethods(target);
  }

  /**
   * Gets the entity name this resolver handles (if specified)
   */
  getResolverName(target: any): string | undefined {
    return this.reflector.get(RESOLVER_NAME_METADATA, target);
  }

  /**
   * Gets the resolver type (entity name or type function)
   */
  getResolverType(target: any): any {
    return this.reflector.get(RESOLVER_TYPE_METADATA, target);
  }

  /**
   * Fallback: checks if any method has GraphQL operation decorators
   */
  private hasGraphQLMethods(target: any): boolean {
    const prototype = target.prototype;
    if (!prototype) return false;

    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      name => name !== 'constructor' && typeof prototype[name] === 'function'
    );

    return methodNames.some(methodName => {
      // Check for @Query/@Mutation/@Subscription on methods
      const resolverType = Reflect.getMetadata(RESOLVER_TYPE_METADATA, prototype, methodName);
      return resolverType === 'Query' || resolverType === 'Mutation' || resolverType === 'Subscription';
    });
  }

  /**
   * Lists all GraphQL operations (Query/Mutation/Subscription) in a resolver
   */
  getGraphQLOperations(target: any): { name: string; type: string }[] {
    const prototype = target.prototype;
    if (!prototype) return [];

    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      name => name !== 'constructor' && typeof prototype[name] === 'function'
    );

    return methodNames
      .map(methodName => {
        const resolverType = Reflect.getMetadata(RESOLVER_TYPE_METADATA, prototype, methodName);
        if (resolverType === 'Query' || resolverType === 'Mutation' || resolverType === 'Subscription') {
          return { name: methodName, type: resolverType };
        }
        return null;
      })
      .filter((op): op is { name: string; type: string } => op !== null);
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

// Example resolver class (from actual codebase)
import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { PingCounterGraphQL } from './ping-counter.types';

@Resolver()
export class PingCounterResolver {
  @Query(() => PingCounterGraphQL)
  async get(): Promise<PingCounterGraphQL> {
    return {} as any;
  }

  @Mutation(() => PingCounterGraphQL)
  async increment(): Promise<PingCounterGraphQL> {
    return {} as any;
  }
}

// Detection test
const detector = new GraphQLResolverDetector();

console.log('Is GraphQL Resolver:', detector.isGraphQLResolver(PingCounterResolver)); // true
console.log('Resolver Name:', detector.getResolverName(PingCounterResolver)); // undefined (no specific type)
console.log('Resolver Type:', detector.getResolverType(PingCounterResolver)); // undefined (no specific type)
console.log('Operations:', detector.getGraphQLOperations(PingCounterResolver));
// Output: [{ name: 'get', type: 'Query' }, { name: 'increment', type: 'Mutation' }]

// ============================================================================
// COMPARISON: WRONG vs RIGHT
// ============================================================================

const reflector = new Reflector();

// ❌ WRONG: This returns undefined
console.log('Wrong key:', reflector.get('graphql:resolver', PingCounterResolver)); // undefined

// ✅ RIGHT: These work
console.log('Correct key (type):', reflector.get('graphql:resolver_type', PingCounterResolver)); // undefined (no type specified)
console.log('Correct key (name):', reflector.get('graphql:resolver_name', PingCounterResolver)); // undefined (no name specified)

// Note: When @Resolver() is used without arguments, both metadata values may be undefined
// The decorator still marks the class, but the metadata isn't set to a specific value
// That's why method-level scanning is useful as a fallback
