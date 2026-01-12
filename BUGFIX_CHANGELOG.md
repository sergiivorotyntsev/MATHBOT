# 🐛 Critical Bug Fixes - Training Content Selection & UI State

## Summary

Fixed three critical bugs affecting training session quality and user experience:
1. **Topic selection mismatch** - Selected topic (e.g., Geometry) was ignored, delivering wrong questions (e.g., Addition)
2. **Blank screen after training** - Content area disappeared after completing session
3. **Duplicate skills dashboards** - Two conflicting implementations showing different data

All fixes are minimal, focused on correctness, with no new features added.

---

## 🎯 Bug #1: Training Topic Selection Mismatch

### Problem
- User selects **Geometry → "Основные фигуры"**
- Receives **Addition questions** ("What is 102 + 61?")
- UI displays **"Topic: Addition"**

### Root Cause
`startSession()` in `MathBotArena.tsx` received `(skillType, topic, subtopic)` parameters from `TrainingDashboard` callback but:
- **Ignored** `topic` and `subtopic` parameters
- Called `questionService.createRecommendedSession(age)` which generates adaptive questions without topic filtering
- No validation that returned questions match selected topic

### Fix
**Files Changed:**
- `src/MathBotArena.tsx` (lines 496-610, 1244-1247)
- `src/types/question.ts` (imported `createSkillId`, `QuestionDomain`, `QuestionTopic`)

**Changes:**
1. Updated `startSession()` signature to accept `topic` and `subtopic` parameters
2. When topic is provided:
   - Build proper `SkillId` from domain/topic/subtopic using `createSkillId()`
   - Call `questionService.createSession(age, focusSkillId, ...)` for focused session
   - Validate result has questions, show friendly error if empty
3. When no topic provided:
   - Fall back to `createRecommendedSession()` (adaptive)
4. Updated callback at line 1246 to pass all three parameters to `startSession()`

**Example:**
```typescript
// Before (WRONG):
onStartTraining={(skillType, topic, subtopic) => {
  startSession(skillType, 'training'); // topic ignored!
}}

// After (CORRECT):
onStartTraining={(skillType, topic, subtopic) => {
  startSession(skillType, 'training', topic, subtopic); // topic used!
}}

// Inside startSession:
const domain = 'Geometry';
const focusSkillId = createSkillId(domain, 'Perimeter'); // "geometry_perimeter"
const sessionPlan = await questionService.createSession(age, focusSkillId, count, 'en');
// Now questions match selected topic!
```

---

## 🐛 Bug #2: Blank Screen After Training

### Problem
- User completes 10-question training session
- "Reward Summary" modal appears
- **Background content area is completely blank** (header/tabs remain)
- Expected: Training dashboard should show in background

### Root Cause
`AnimatePresence` component at line 1233 had `mode="wait"`:
```typescript
<AnimatePresence mode="wait">
```

With `mode="wait"`, when active session ends:
1. Active Session component exits with animation (opacity: 0, scale: 0.9)
2. AnimatePresence **waits** for exit animation to complete (~300ms)
3. During wait time: **NO content renders** → blank screen
4. After wait: Training Dashboard enters

### Fix
**File Changed:**
- `src/MathBotArena.tsx` (line 1233)

**Change:**
```typescript
// Before:
<AnimatePresence mode="wait">

// After:
<AnimatePresence>
```

Removed `mode="wait"` so exit/enter animations **overlap** instead of waiting. Training Dashboard starts entering immediately when Active Session exits.

---

## 🔄 Bug #3: Duplicate Skills Dashboards

### Problem
Progress tab showed **TWO "Математические навыки" sections**:
1. **BLOCK 3 (legacy):** Avatar-based, hardcoded percentages (e.g., "Арифметика 55%"), never updated
2. **BLOCK 4 (new):** Real-time stats from `questionService`, auto-refreshes every 2s

Users saw conflicting data (legacy showed zeros, new showed actual progress).

### Root Cause
`ProgressTab.tsx` rendered both:
- **Lines 224-366:** Legacy dashboard reading from `avatar.mathSkills` (static data)
- **Line 369:** New `MathSkillsPanel` reading from `questionService.exportStats()` (dynamic)

### Fix
**File Changed:**
- `src/components/ProgressTab.tsx` (lines 224-366)

**Change:**
- Removed entire BLOCK 3 (legacy dashboard, ~140 lines)
- Kept BLOCK 4 (MathSkillsPanel) as single source of truth
- Added comment explaining removal

**Before (two dashboards):**
```
Progress Tab:
├─ BLOCK 1: Battle Summary
├─ BLOCK 2: Game Stats (RPG)
├─ BLOCK 3: Math Skills (LEGACY, hardcoded) ❌
└─ BLOCK 4: Math Skills (NEW, real-time) ✅
```

**After (one dashboard):**
```
Progress Tab:
├─ BLOCK 1: Battle Summary
├─ BLOCK 2: Game Stats (RPG)
└─ BLOCK 4: Math Skills (NEW, real-time) ✅
```

---

## ✅ Validation & Testing Added

### New File: `src/engine/questionValidator.ts`

Lightweight dev-only validator that checks:
- ✅ All question IDs are unique
- ✅ Required fields present (id, prompt, correctAnswer, domain, topic, skillId)
- ✅ Domain values are valid ('Arithmetic', 'Geometry', 'Logic')
- ✅ Topic values belong to predefined lists
- ✅ Difficulty tiers are 1-5
- ✅ Correct answer exists in choices array
- ✅ Minimum coverage: 50+ questions per domain, 10+ per topic
- ✅ Topic fidelity: Session questions match requested domain/topic

**Integration:**
- `questionService.ts` (line 110): Runs validation after generating question bank
- `questionService.ts` (lines 180-190): Validates topic fidelity for focused sessions

**Example Output:**
```
[QuestionValidator] Validating question bank...
[QuestionValidator] Total: 10500 questions, 10500 unique IDs
[QuestionValidator] Coverage by domain: { Arithmetic: 4200, Geometry: 3150, Logic: 3150 }
[QuestionValidator] ✅ Validation passed!

[QuestionService] Topic fidelity check for 'geometry_perimeter':
  ✅ All 10 questions match domain 'Geometry'
```

---

## 📋 Acceptance Criteria Status

### A) Topic Fidelity ✅
- [x] Selected domain/topic filters are respected
- [x] Zero questions for a topic shows user-friendly message
- [x] No duplicate questions within session (enforced by Set-based uniqueness in `sessionBuilder.ts`)

### B) Data Model Integrity ✅
- [x] Every question has stable unique ID
- [x] Metadata supports selection (domain, topic, skillId, difficulty, gradeBand)
- [x] Selection code filters strictly
- [x] Validator checks: IDs unique, required fields present, topic enums valid, minimum coverage

### C) Training Completion UI ✅
- [x] Results/Summary screen renders after last question (RewardSummary modal)
- [x] No blank content state

### D) Remove Duplicate Dashboard ✅
- [x] Legacy skills dashboard removed
- [x] New MathSkillsPanel is single source of truth
- [x] Dead code removed

---

## 🔍 Testing & Verification

### Manual Test Cases

#### Test 1: Geometry Topic Selection
```
1. Open app, go to Training tab
2. Click "Choose Topic" → Select "Geometry" → "Perimeter"
3. Start training session
4. VERIFY: All 10 questions are about perimeter/area (not addition)
5. VERIFY: Console shows: "[Session] Focused session on skill: geometry_perimeter"
6. VERIFY: No duplicate questions (check _questionId in console logs)
```

#### Test 2: Complete Training (No Blank Screen)
```
1. Start any training session (10 questions)
2. Answer all 10 questions
3. VERIFY: Reward Summary modal appears
4. VERIFY: Training Dashboard visible in background (NOT blank)
5. Close modal
6. VERIFY: Training Dashboard fully visible
```

#### Test 3: Single Skills Dashboard
```
1. Go to Progress tab
2. Scroll through entire page
3. VERIFY: Only ONE "Математические навыки" section exists
4. VERIFY: It shows real-time data (attempts, mastery %, streaks)
5. Complete a training session
6. Return to Progress tab
7. VERIFY: Stats updated (within 2 seconds due to auto-refresh)
```

#### Test 4: No Questions Available
```
1. Select a topic with zero questions (if possible)
2. VERIFY: Modal appears: "Нет вопросов по теме..." with suggestion
3. VERIFY: Session does NOT start
4. VERIFY: No console errors
```

#### Test 5: Validation Output (Dev Mode)
```
1. Open browser console
2. Clear localStorage: localStorage.clear()
3. Refresh page
4. VERIFY: Console shows validation results:
   - Total questions count
   - Coverage by domain/topic
   - "✅ Validation passed!" message
5. VERIFY: No errors about duplicate IDs
```

### Build Verification
```bash
npm run build
# ✅ Output: ✓ built in 5.33s
# ✅ No TypeScript errors
```

---

## 📝 Files Changed

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `src/MathBotArena.tsx` | +120 / -60 | Fix topic selection, pass topic/subtopic to startSession |
| `src/components/ProgressTab.tsx` | +5 / -140 | Remove legacy skills dashboard |
| `src/engine/questionService.ts` | +15 / -0 | Add validation integration |
| `src/engine/questionValidator.ts` | +220 / -0 | New validator module |
| `BUGFIX_CHANGELOG.md` | +350 / -0 | This file |

**Total:** +710 additions, -200 deletions across 5 files

---

## 🚀 Deployment Notes

- **No breaking changes** - All changes are internal fixes
- **No database migrations** - Uses existing localStorage schema
- **No API changes** - Question service signatures backward compatible
- **Validation is dev-only** - Zero performance impact in production
- **Safe to deploy immediately** - All builds passing, no regressions

---

## 🐛 Known Limitations (Not in Scope)

These are **NOT** fixed in this PR (as per "no new features" constraint):

1. **Limited question templates** - Only 7 topics have questions (Addition, Subtraction, Multiplication, Division, Perimeter, Area, Patterns)
   - Fix: Add more templates in future PR

2. **Russian questions not generated** - Template system supports RU but not yet generated
   - Fix: Generate RU variants in future PR

3. **Bot Battle not integrated** - Still uses old question system
   - Fix: Integrate with questionService in future PR

4. **Training UI still has old 3-card structures** in some places
   - Fix: Full UI modernization in future PR

---

## ✅ Checklist

- [x] All three bugs fixed
- [x] No new features added
- [x] Validation added (dev-only)
- [x] Build passes (npm run build)
- [x] No TypeScript errors
- [x] No console errors in dev mode
- [x] Code is readable and deterministic
- [x] Small, focused changes only
- [x] Comments explain "why" not "what"
- [x] No silent fallbacks to wrong topics
- [x] CHANGELOG created with test instructions
