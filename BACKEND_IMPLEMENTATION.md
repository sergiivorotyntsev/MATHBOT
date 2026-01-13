# MATHBOT Arena - Backend Implementation Guide

## 🎯 Project Scope

Converting MATHBOT from a client-side app to a full-stack application with:
- **Backend API** (Express + Prisma)
- **Database** (SQLite for dev, Postgres-ready for production)
- **Admin UI** (CRUD for questions, skills, materials)
- **CSV Import/Export** (Bulk question management)
- **Database-driven session builder** (Replaces file-based system)

**Status**: 🏗️ Foundation Complete | 📋 Implementation in Progress

---

## ✅ Phase 1: Foundation (COMPLETE)

### 1.1 Database Schema (Prisma + SQLite)

**9 Tables Created**:
1. **User** - Student/admin accounts with age, grade, role
2. **Skill** - Taxonomy (14 core skills: arithmetic_addition, geometry_shapes, etc.)
3. **Question** - Question bank with metadata (domain, topic, difficulty, age/grade targeting)
4. **Session** - Training session records
5. **SessionQuestion** - Join table (session ↔ questions, enforces no duplicates)
6. **Attempt** - Answer log (every answer persisted)
7. **Mastery** - Computed progress per user per skill (mastery score, rolling accuracy, spaced repetition)
8. **Material** - Learning resources (videos, articles, worksheets)
9. **AuditLog** - Admin action tracking

**Files Created**:
- `prisma/schema.prisma` (289 lines) - Complete schema with indexes
- `prisma/migrations/20260113044511_init/` - Initial migration
- `.env.example` - Environment configuration template

**Key Features**:
- Foreign key relationships with CASCADE deletes
- Composite indexes for fast queries
- JSON fields for arrays (prerequisites, tags, choices)
- Content hash for duplicate detection
- Spaced repetition fields (dueAt, lastSeenAt)
- Postgres-compatible design (using SQLite for dev)

### 1.2 Server Structure (Express)

**Files Created**:
- `server/src/index.ts` (150 lines) - Main Express app with:
  - CORS configuration
  - Error handling (404 + global)
  - Health check endpoint
  - Graceful shutdown handlers
  - Prisma connection

- `server/src/middleware/auth.ts` (85 lines) - Authentication:
  - `requireAdmin()` - Admin password gate (MVP, TODO: JWT/RBAC)
  - `requireUser()` - User ID validation
  - `optionalAuth()` - Optional authentication

- `server/src/validators/schemas.ts` (200+ lines) - Zod schemas for:
  - CreateSkillSchema, UpdateSkillSchema
  - CreateQuestionSchema, UpdateQuestionSchema, BulkImportQuestionSchema
  - CreateSessionSchema, UpdateSessionSchema
  - CreateAttemptSchema
  - CreateUserSchema, UpdateUserSchema
  - QuestionQuerySchema, SessionQuerySchema
  - CSVQuestionRowSchema (for bulk import)

**Dependencies Installed**:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "prisma": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.2",
    "concurrently": "^8.2.2"
  }
}
```

---

## 📋 Phase 2: API Routes (IN PROGRESS)

### 2.1 API Endpoints to Create

**Skills API** (`/api/skills`)
- `GET /api/skills` - List all skills (with filters: domain, topic, gradeMin/gradeMax)
- `GET /api/skills/:id` - Get single skill with prerequisites
- `POST /api/skills` [ADMIN] - Create skill
- `PUT /api/skills/:id` [ADMIN] - Update skill
- `DELETE /api/skills/:id` [ADMIN] - Delete skill (cascade to questions)

**Questions API** (`/api/questions`)
- `GET /api/questions` - Search questions (filters: skillId, domain, topic, difficulty, age, grade, locale, validated)
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` [ADMIN] - Create question
- `PUT /api/questions/:id` [ADMIN] - Update question
- `DELETE /api/questions/:id` [ADMIN] - Delete question
- `POST /api/questions/bulk-import` [ADMIN] - Import from CSV
- `GET /api/questions/export` [ADMIN] - Export to CSV
- `POST /api/questions/validate` [ADMIN] - Validate bank integrity

**Sessions API** (`/api/sessions`)
- `POST /api/sessions` - Create new session (calls session builder)
- `GET /api/sessions/:id` - Get session with questions
- `PUT /api/sessions/:id` - Update session (end time, results)
- `GET /api/sessions/user/:userId` - Get user's session history

**Attempts API** (`/api/attempts`)
- `POST /api/attempts` - Record answer
- `GET /api/attempts/session/:sessionId` - Get all attempts for session
- `GET /api/attempts/question/:questionId` - Get all attempts for question (admin)

**Users API** (`/api/users`)
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/mastery` - Get user's mastery records

**Admin API** (`/api/admin`)
- `GET /api/admin/stats` [ADMIN] - Bank health dashboard (counts by domain/grade/difficulty)
- `GET /api/admin/duplicates` [ADMIN] - Find duplicate questions
- `GET /api/admin/orphans` [ADMIN] - Find questions with invalid skillId
- `GET /api/admin/audit-log` [ADMIN] - Get audit trail

### 2.2 Session Builder Service

**File**: `server/src/services/sessionBuilder.ts`

**Algorithm** (as specified):
1. **Input**: userId, selectedSkillIds[], targetDifficulty, questionCount
2. **Filter**: Questions WHERE skillId IN selected, locale matches, age/grade constraints satisfied
3. **Ranking**:
   - Prioritize "due for review" (from Mastery table where dueAt <= NOW)
   - Then new items near targetDifficulty
4. **Sampling**: Choose N unique questionIds (no repeats)
5. **Guardrails**:
   - Never pick questions outside selected skills
   - Never pick items with missing/invalid metadata (validated=false)
   - Monotonic difficulty (can drift ±1-2, not jump 2→9)
6. **Output**: Session record + SessionQuestion join records

**TODO**: Implement this logic in `server/src/services/sessionBuilder.ts`

---

## 📋 Phase 3: CSV Import/Export (PENDING)

### 3.1 CSV Template

**File**: `docs/question-import-template.csv`

**Columns**:
```csv
id,domain,skillId,topic,subtopic,difficulty,ageMin,ageMax,gradeMin,gradeMax,locale,prompt,choiceA,choiceB,choiceC,choiceD,correctChoice,explanation,tags,version
```

**Example Row**:
```csv
,Geometry,geometry_shapes,Shapes,,3,6,9,K-1,2-3,en,Which shape has 3 sides?,Triangle,Square,Circle,Pentagon,A,A triangle has three sides,visual;basic,1
```

### 3.2 Import Validator

**File**: `server/src/services/csvImporter.ts`

**Validation Steps**:
1. Parse CSV using Zod schema (CSVQuestionRowSchema)
2. Check all skillIds exist in Skill table
3. Check domain/topic matches skill taxonomy
4. Detect duplicates by content hash
5. Validate difficulty is appropriate for gradeBand
6. Return validation report + parsed questions
7. Optionally perform "dry run" (no DB writes)

---

## 📋 Phase 4: Data Migration (PENDING)

### 4.1 Migrate Existing Questions to Database

**File**: `scripts/migrateQuestions.ts`

**Steps**:
1. Read current question templates from `src/engine/questionGenerator.ts`
2. For each template:
   - Extract domain, topic, difficulty
   - Map to skillId using `src/curriculum/skills.ts`
   - Generate sample questions (or use generator params)
   - Create Question records in database
3. Mark migrated questions as `validated=true`
4. Handle unmapped questions:
   - Create "unclassified" skill
   - Mark as `validated=false`
   - Exclude from sessions until fixed

### 4.2 Seed Skills Table

**File**: `prisma/seed.ts`

**Steps**:
1. Import SKILL_REGISTRY from `src/curriculum/skills.ts`
2. Create Skill records for all 14 core skills
3. Run: `npx prisma db seed`

---

## 📋 Phase 5: Frontend Integration (PENDING)

### 5.1 API Client

**File**: `src/api/client.ts`

**Methods**:
```typescript
export const api = {
  skills: {
    list: (filters?) => GET /api/skills
    get: (id) => GET /api/skills/:id
  },
  questions: {
    search: (filters) => GET /api/questions
    get: (id) => GET /api/questions/:id
  },
  sessions: {
    create: (config) => POST /api/sessions
    get: (id) => GET /api/sessions/:id
    update: (id, data) => PUT /api/sessions/:id
  },
  attempts: {
    record: (attempt) => POST /api/attempts
  },
  users: {
    get: (id) => GET /api/users/:id
    getMastery: (id) => GET /api/users/:id/mastery
  }
}
```

### 5.2 Replace localStorage with API

**Files to Update**:
- `src/MathBotArena.tsx` - Use api.sessions.create() instead of buildSession()
- `src/progress/attemptLog.ts` - Use api.attempts.record() instead of localStorage
- `src/components/ProgressTab.tsx` - Fetch from api.users.getMastery() instead of local stats

---

## 📋 Phase 6: Admin UI (PENDING)

### 6.1 Admin Route

**File**: `src/admin/AdminPanel.tsx`

**Features**:
1. **Auth Gate**: Password input (checks against /api/admin/auth)
2. **Question List**: Filterable table (domain, topic, skill, difficulty, age, grade, locale)
3. **Question Editor**: Form with JSON preview
4. **Bulk Import**: CSV upload + validation report + dry run
5. **Skills Editor**: Taxonomy management + prerequisites
6. **Materials Manager**: CRUD for learning resources
7. **Bank Health Dashboard**:
   - Counts by domain/grade/difficulty
   - Duplicates detector
   - Orphan questions (invalid skillId)
   - Missing metadata warnings

### 6.2 Admin Password Gate

**Component**: `src/admin/AdminAuth.tsx`

```typescript
const [password, setPassword] = useState('');

const handleAuth = async () => {
  try {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      localStorage.setItem('adminToken', password);
      setAuthenticated(true);
    }
  } catch (error) {
    alert('Invalid password');
  }
};
```

---

## 🚀 Development Workflow

### Start Development

```bash
# Terminal 1: Start backend API
npm run dev:server

# Terminal 2: Start frontend
npm run dev

# Or run both concurrently:
npm run dev:all
```

### Package.json Scripts (to add)

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "nodemon --exec tsx server/src/index.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
    "build": "npm run validate && vite build",
    "build:server": "tsc --project server/tsconfig.json",
    "validate": "tsx scripts/validateQuestionBank.ts",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "test": "vitest && npm run validate"
  }
}
```

### Environment Variables

```bash
# .env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
ADMIN_PASSWORD=changeme123
FRONTEND_URL=http://localhost:3000
```

---

## 📊 Progress Tracking

### ✅ Complete (40%)
- [x] Database schema (Prisma)
- [x] Database migration
- [x] Prisma client generation
- [x] Express server setup
- [x] Auth middleware (admin + user)
- [x] Zod validation schemas
- [x] Health check endpoint
- [x] Error handling
- [x] CORS configuration

### 🏗️ In Progress (20%)
- [ ] Skills API routes
- [ ] Questions API routes
- [ ] Sessions API routes
- [ ] Attempts API routes
- [ ] Users API routes
- [ ] Admin API routes

### 📋 Pending (40%)
- [ ] Session builder service
- [ ] CSV import/export
- [ ] Question migration script
- [ ] Seed script (skills)
- [ ] Frontend API client
- [ ] Admin UI components
- [ ] Frontend integration (replace localStorage)
- [ ] Bank validation API endpoint
- [ ] Duplicate detector
- [ ] Orphan question finder

---

## 🎯 Next Steps (Priority Order)

1. **Create API Routes** (4-6 hours)
   - Skills CRUD
   - Questions CRUD + search
   - Sessions create/update
   - Attempts recording
   - Admin endpoints

2. **Session Builder Service** (2 hours)
   - Implement ranking algorithm
   - Spaced repetition logic
   - Difficulty guardrails

3. **CSV Import/Export** (2 hours)
   - Template creation
   - Parser + validator
   - Dry run feature

4. **Data Migration** (2 hours)
   - Seed skills table
   - Migrate existing questions
   - Handle edge cases

5. **Frontend API Integration** (3-4 hours)
   - Create API client
   - Replace localStorage calls
   - Update components

6. **Admin UI** (4-6 hours)
   - Auth gate
   - Question CRUD
   - Bulk import interface
   - Bank health dashboard

**Total Estimated Time**: 17-22 hours

---

## 🔒 Security Considerations

### Current (MVP)
- Simple password-based admin auth
- User ID in header (x-user-id)
- CORS configured for localhost

### Production TODO
- [ ] Replace ADMIN_PASSWORD with JWT/session-based auth
- [ ] Implement proper user authentication (OAuth, email/password, SSO)
- [ ] Add RBAC (roles: student, teacher, admin, super-admin)
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization (prevent XSS, SQL injection via Prisma)
- [ ] HTTPS enforcement
- [ ] Secure session cookies (httpOnly, secure, sameSite)
- [ ] Audit logging for all admin actions
- [ ] CSRF protection
- [ ] Content Security Policy headers

---

## 📚 Architecture Decisions

### Why SQLite for Dev?
- Zero configuration
- File-based (easy to reset/version)
- Fast for local development
- Same SQL as Postgres (via Prisma)

### Why Prisma?
- Type-safe queries
- Auto-generated types
- Migration system
- Works with SQLite + Postgres
- Great DX

### Why Express?
- Mature ecosystem
- Excellent TypeScript support
- Middleware architecture
- Easy to understand
- Production-ready

### Why Zod?
- Runtime validation
- TypeScript inference
- Composable schemas
- Great error messages
- Industry standard

---

## 🧪 Testing Strategy

### API Tests (to add)
- Unit tests for validators (Zod schemas)
- Integration tests for endpoints
- Session builder logic tests
- CSV import validator tests

### Database Tests
- Migration rollback tests
- Foreign key constraint tests
- Duplicate detection tests

### E2E Tests
- Full session flow (create → answer → complete)
- Admin workflow (import CSV → validate → publish)
- Progress tracking (attempt → mastery update)

---

## 📖 API Documentation (to generate)

Use Swagger/OpenAPI for auto-generated docs:

```bash
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express
```

Access at: `http://localhost:3001/api-docs`

---

## 🎓 Learning Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Zod Documentation](https://zod.dev)
- [REST API Best Practices](https://restfulapi.net)

---

**Last Updated**: 2026-01-13
**Status**: Foundation Complete, API Routes Next
**Completion**: ~40% (Foundation + Design)
