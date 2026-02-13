# Development Rules & Conventions

## Project Overview
- **Runtime**: Bun
- **Language**: TypeScript (ESNext)
- **Module System**: ESM
- **Code Quality**: Biome for linting/formatting

---

## File Creation & Documentation Standards

### 1. All New Files MUST Include

Every new file created MUST have a header comment block containing:

```typescript
/**
 * @file {filename}
 * @description {Brief description of what this file does}
 * @author Claude & User
 * @created {YYYY-MM-DD}
 *
 * @notes
 * - {Key implementation decisions}
 * - {Dependencies on other files}
 * - {Potential issues or considerations}
 *
 * @todo
 * - [ ] {Pending task 1}
 * - [ ] {Pending task 2}
 */
```

### 2. TODO Tracking Standards

All TODOs must follow this format:

```typescript
// TODO: [{Priority}] {Brief description} - {Reason/Context} - {Date if needed}
// Example:
// TODO: [HIGH] Implement error handling for API failures - Critical for production - 2025-02-12
// TODO: [MEDIUM] Add unit tests for validation functions - Testing coverage
// TODO: [LOW] Consider adding caching layer - Performance optimization
```

Priorities:
- **CRITICAL**: Blocks functionality, must fix immediately
- **HIGH**: Important for next release
- **MEDIUM**: Should be done soon
- **LOW**: Nice to have, can defer

### 3. Progress Comments for Complex Functions

For functions longer than 20 lines or with complex logic:

```typescript
/**
 * Process user authentication
 *
 * @progress
 * - ✅ Step 1: Validate credentials (completed 2025-02-10)
 * - ✅ Step 2: Generate JWT token (completed 2025-02-11)
 * - 🔄 Step 3: Refresh token handling (in progress)
 * - ⏳ Step 4: Session management (pending)
 *
 * @changelog
 * - 2025-02-11: Added JWT token generation
 * - 2025-02-10: Initial implementation with credential validation
 */
```

### 4. Change Documentation

When modifying existing code, add inline documentation:

```typescript
// MODIFIED: 2025-02-12 - Added error boundary for null user data
// PREVIOUS: Returned empty object on error
// REASON: Prevents null reference errors downstream
if (!user) throw new UserNotFoundError();

// ADDED: 2025-02-12 - Rate limiting to prevent abuse
// CONTEXT: API was being hit too frequently
await checkRateLimit(userId);

// DEPRECATED: 2025-02-12 - Use newAuthService() instead
// REMOVAL_DATE: 2025-03-01
```

### 5. File-level Change Log

At the top of modified files, add:

```typescript
/**
 * @changelog
 * - 2025-02-12: Fixed authentication bug, added rate limiting
 * - 2025-02-10: Initial file creation with basic CRUD operations
 *
 * @known_issues
 * - [Issue 1] {Description} - {Workaround if any}
 *
 * @improvements_needed
 * - Add proper error types instead of generic Error
 * - Consider implementing caching for performance
 */
```

---

## Code Style Rules

### 1. Function Documentation

```typescript
/**
 * Calculate the total price including tax
 *
 * @param basePrice - The base price before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total price rounded to 2 decimal places
 *
 * @throws {ValidationError} If basePrice is negative
 *
 * @example
 * ```ts
 * calculateTotal(100, 0.1) // Returns 110.00
 * ```
 */
function calculateTotal(basePrice: number, taxRate: number): number {
  // Implementation
}
```

### 2. Variable Naming Conventions

```typescript
// ✅ GOOD - Descriptive and clear
const userAuthenticationToken: string;
const isLoadingUserProfiles: boolean;
const MAX_RETRY_ATTEMPTS = 3;

// ❌ BAD - Unclear abbreviations
const uat: string;
const flag: boolean;
const num = 3;
```

### 3. Comment Guidelines

**DO comment:**
- Why a decision was made
- Non-obvious algorithms
- Workarounds for bugs/issues
- Performance considerations
- Security considerations

**DON'T comment:**
- Obvious code (e.g., `// Increment counter` for `i++`)
- Outdated information (remove or update it)
- Large blocks of commented-out code (use version control)

---

## Task & Progress Tracking

### 1. Start of Complex Work

Before starting complex tasks, create a TODO list:

```typescript
/*
 * TASK: Implement user authentication flow
 *
 * CHECKLIST:
 * - [ ] 1. Design authentication schema
 * - [ ] 2. Implement password hashing
 * - [ ] 3. Create JWT token generation
 * - [ ] 4. Add refresh token logic
 * - [ ] 5. Implement session management
 * - [ ] 6. Write unit tests
 * - [ ] 7. Add integration tests
 * - [ ] 8. Document API endpoints
 *
 * NOTES:
 * - Use bcrypt for password hashing
 * - JWT secret should be in env variable
 * - Consider adding rate limiting
 */
```

### 2. Work Session Notes

When working on a feature, track your progress:

```typescript
/*
 * WORK SESSION: 2025-02-12
 *
 * COMPLETED:
 * - ✅ Set up project structure
 * - ✅ Configured TypeScript
 * - ✅ Created base API routes
 *
 * IN PROGRESS:
 * - 🔄 Implementing user model
 *
 * BLOCKED BY:
 * - Need to decide on database (PostgreSQL vs MongoDB)
 *
 * NEXT:
 * - [ ] Finalize user model
 * - [ ] Add validation middleware
 */
```

---

## Git Commit Standards

Follow conventional commit format:

```
{type}({scope}): {description}

{optional body with explanations}

{optional footer with issue references}
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring without functional change
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `security`: Security vulnerability fixes

**Example:**
```
feat(auth): implement JWT-based authentication

Added login and refresh token endpoints with proper error handling.
Implemented rate limiting to prevent abuse.

Closes #42
```

---

## Testing Standards

### 1. Test File Structure

```typescript
/**
 * @file user.service.test.ts
 * @description Unit tests for user service
 * @coverage Target: 90%+
 *
 * @test_cases
 * - User creation with valid data
 * - User creation with duplicate email
 * - User retrieval by ID
 * - User update with partial data
 * - User deletion and soft delete
 */
```

### 2. Test Documentation

```typescript
describe('UserService', () => {
  /*
   * TEST: createNewUser
   * EXPECTED: Should create user with valid data
   * COVERS: Success case, validation, unique email constraint
   */
  test('should create user with valid data', async () => {
    // Test implementation
  });
});
```

---

## Error Handling Rules

### 1. Always Specify Error Types

```typescript
// ✅ GOOD - Specific error type
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

// ❌ BAD - Generic error
throw new Error('User not found');
```

### 2. Document Error Cases

```typescript
/**
 * Fetch user by ID
 *
 * @throws {UserNotFoundError} If user doesn't exist
 * @throws {DatabaseError} If database connection fails
 * @throws {ValidationError} If ID format is invalid
 */
```

---

## Performance & Optimization Notes

### 1. Mark Performance-Critical Code

```typescript
/*
 * PERFORMANCE NOTE: Hot path function called on every request
 * - O(n) complexity where n = user permissions
 * - TODO: Cache permissions for 5 minutes
 * - BENCHMARK: 1000 calls took 45ms
 */
function checkPermissions(user: User): boolean {
  // Implementation
}
```

### 2. Document Trade-offs

```typescript
/*
 * TRADE-OFF ANALYSIS
 *
 * Option Chosen: In-memory caching
 * Alternatives Considered:
 * - Redis: More scalable but adds dependency
 * - Database query: Simpler but slower
 * - No caching: Fastest for small scale, slow for large
 *
 * Rationale: In-memory is sufficient for current scale (<1000 users)
 * REVISIT: When user count exceeds 10,000
 */
```

---

## Security Checklist

For any code involving:
- Authentication/Authorization: Validate permissions on every request
- User Input: Sanitize and validate all inputs
- External APIs: Rate limit and validate responses
- File Operations: Validate file paths and types
- Secrets: Never commit to repo, use environment variables

```typescript
/*
 * SECURITY CONSIDERATIONS:
 * - ✅ Input validation on all user inputs
 * - ✅ SQL injection prevention via parameterized queries
 * - ✅ XSS protection via output escaping
 * - ⚠️ Need to add CSRF tokens
 * - ⏳ Implement CSP headers
 */
```

---

## Quick Reference

| When Creating/Modifying | Must Include |
|------------------------|--------------|
| New file | Header comment with @file, @description, @created, @notes, @todo |
| Complex function | @progress with checklist, @changelog |
| Any TODO | Priority [CRITICAL/HIGH/MEDIUM/LOW], context, date |
| Bug fix | @changelog with problem and solution |
| Performance change | @performance note with benchmark |
| Security change | @security considerations |
| New feature | Document in docs/{feature}.md |

---

## Priority Levels

- **CRITICAL**: Security issues, data loss, blocking functionality
- **HIGH**: Important bugs, requested features, performance issues
- **MEDIUM**: Improvements, code quality, documentation gaps
- **LOW**: Nice-to-haves, refactoring, tech debt

---

## File Organization Notes

When creating new files, consider:

1. **Purpose**: What is this file responsible for?
2. **Dependencies**: What does it depend on?
3. **Coupling**: Is it tightly coupled to other files?
4. **Testing**: Is it easily testable?

Document these considerations in the file header.
