# NestJS Shop Project - Claude Instructions

## Project Context
- **Framework**: NestJS with TypeScript
- **Architecture**: Clean Architecture + Hexagonal (Ports & Adapters)
- **Code Style**: Functional programming patterns preferred

## Project-Specific Rules

### Code Organization
- **Use existing patterns**: Follow adapter/secondary structure
- **Type safety**: Always validate API responses with runtime type checking
- **Error handling**: Use NestJS exception filters, not raw throws

### Dependencies
- **Prefer existing**: Check package.json before suggesting new libraries
- **Stargate focus**: This project integrates with Stargate protocol

### Testing
- **Unit tests**: Jest with .spec.ts extension
- **Integration tests**: Separate e2e/ directory

## Auto-Activation Rules

### TypeScript NestJS Context
- Use **typescript-nestjs-reviewer** agent for code reviews
- Apply **backend-architect** for system design questions
- Enable **Context7** for NestJS documentation lookup

### Domain-Specific Keywords
- "adapter" → Review hexagonal architecture compliance
- "stargate" → Load Stargate documentation and patterns
- "http-client" → Consider axios-http-client.adapter.ts patterns

## Quality Gates
- ✅ Type safety with runtime validation (class-validator, zod)
- ✅ Error handling with proper NestJS exceptions
- ✅ Adapter pattern compliance in secondary/ directory
- ✅ Dependency injection over direct instantiation

## Forbidden Patterns
- ❌ Any type without explicit reason
- ❌ Console.log in production code (use Logger)
- ❌ Direct HTTP calls without adapter abstraction
- ❌ Breaking changes without migration strategy
