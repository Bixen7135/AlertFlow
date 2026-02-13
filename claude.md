# claude.md

**Behavioral Rules for Claude Code**

## State Discipline

### MANDATORY: Synchronize with State Files

After ANY code modification:

1. **Append to `PROGRESS.md`** - Log the change made
2. **Update `TODO.md`** - Add task if not present, mark completed if done
3. **Append to `ISSUES.md`** - When debugging or encountering blockers
4. **Append to `DECISIONS.md`** - When making architectural or structural decisions

### NEVER

- Rewrite existing entries in state files
- Remove history from state files
- Invent past work or context
- Edit existing state file entries

### ALWAYS

- Append ONLY to state files
- Keep entries concise
- Start logging from current session
- Summarize to PROJECT_NOTES.md if context grows large

## Execution Flow

Before modifying code:
- Ensure task exists in TODO.md
- If not, add it first

After modifying code:
- Log change in PROGRESS.md
- Mark task completed in TODO.md (if applicable)

When debugging:
- Log investigation in ISSUES.md

When refactoring:
- Log reasoning in DECISIONS.md

## Behavioral Guardrails

- Do not overengineer
- Do not introduce unnecessary abstractions
- Do not create helper scripts unless required
- Implement general solutions
- Avoid speculative reasoning
- Default to implementation if clearly requested

## Project Context
See CLAUDE.md for:
- Development commands
- File documentation standards
- Code style conventions
- Testing guidelines

## Architecture Documentation

**Architecture for Project.md** is the single source of truth for:
- System architecture diagrams and component relationships
- Data flow between services
- Technology stack decisions
- Deployment topology
- Integration patterns

When implementing features:
1. Review Architecture for Project.md for context
2. Follow established patterns
3. Update architecture document when introducing new components or changing data flow

## Docker Best Practices

### Container Guidelines
- Use official base images (e.g., `node:alpine`, `python:slim`)
- Pin specific image versions (avoid `latest` tags)
- Use multi-stage builds for production images
- Minimize layer count by combining RUN commands
- Clean up package caches in same layer

### Docker Compose Standards
- Define services in `docker-compose.yml` for local development
- Use environment files (`.env`) for configuration
- Specify restart policies (`unless-stopped` for production)
- Declare volumes for persistent data
- Use networks to isolate services

### Security
- Run containers as non-root users
- Scan images for vulnerabilities
- Don't embed secrets in Dockerfiles or compose files
- Use read-only root filesystems when possible

## Frontend Design System

### MANDATORY: Single Source of Truth

**frontend-design-guidelines.md** is the single source of truth for all frontend development.

### Frontend Development Requirements

1. **Before Implementation**:
   - Review `frontend-design-guidelines.md` for applicable patterns
   - Follow established design tokens and component standards
   - Ensure alignment with defined layout, typography, and spacing rules

2. **During Implementation**:
   - Use the frontend-design skill for all UI/component creation
   - Adhere strictly to accessibility constraints defined in guidelines
   - Maintain consistency with existing interaction states and component structure

3. **After Visual/Component Changes**:
   - **MANDATORY**: Update `frontend-design-guidelines.md` BEFORE or TOGETHER with implementation
   - Document any new design tokens, patterns, or components
   - Ensure version traceability between specification and implementation

4. **Prohibited Actions**:
   - NEVER introduce visual changes without updating the guidelines file
   - NEVER diverge from defined design tokens without documentation
   - NEVER bypass the frontend-design system for custom implementations

### Design System Consistency

- All visual changes must propagate to `frontend-design-guidelines.md`
- Component-level modifications require guideline updates
- Prevents divergence between implementation and design specification
- Ensures unified visual and architectural style across the project
