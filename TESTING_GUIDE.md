# 🧪 Manual Testing Guide - MathBot Arena

**Version:** 2.0 (New Question Engine)
**Date:** 2026-01-12

This guide provides step-by-step instructions for manually testing the new adaptive question engine and stats system.

---

## 🎯 **Testing Objectives**

Verify that:
1. ✅ Questions never repeat within a session
2. ✅ Dashboard updates after sessions
3. ✅ Stats are accurate and persistent
4. ✅ Mastery calculation works correctly
5. ✅ XP progress never exceeds 100%
6. ✅ Adaptive difficulty adjusts properly
7. ✅ No console errors occur

---

## 🚀 **Prerequisites**

### 1. Start Development Server:
```bash
cd /home/user/MATHBOT
npm run dev
```

### 2. Open Browser:
- URL: http://localhost:3000
- Open Developer Tools (F12)
- Open Console tab
- **Keep console open during all tests**

### 3. Clear Previous Data (Optional):
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## 📋 **Test Suite**

### Test 1: New User Registration ✅

**Steps:**
1. Click "Начать" on welcome screen
2. Fill in registration form:
   - Name: "Test User"
   - Age: 10
   - Email: "test@example.com"
3. Click "Создать героя"
4. Select an avatar
5. Confirm selection

**Expected:**
- ✅ Successfully reaches main game screen
- ✅ No console errors

**Pass/Fail:** [ ]

---

### Test 2: Session Creation ✅

**Steps:**
1. Click "Training" tab (if not already there)
2. Click any skill (Arithmetic/Geometry/Logic)
3. Click "Start Training" or equivalent
4. **Immediately check console**

**Expected Console Output:**
```
[Session] Starting training session for arithmetic (age 10)
[Session Summary]
  Total questions: 10
  New system: 10
  Old system: 0
  Skills covered: arithmetic_addition, arithmetic_subtraction
```

**Verify:**
- ✅ Session starts successfully
- ✅ Console shows session summary
- ✅ "New system: 10" (all questions from new engine)
- ✅ Skills listed make sense for age

**Pass/Fail:** [ ]

---

### Test 3: No Duplicate Questions ✅

**Steps:**
1. During a training session, **write down all question IDs**
2. After session, run in console:
```javascript
// Get question IDs from last session
const ids = JSON.parse(localStorage.getItem('mathbot_arena_v2'))
  ?.playerBot?.statistics?.lastSession || [];
console.log('Question IDs:', ids);

// Or manually check as you go
```

**Manual Check:**
- Note the actual questions as they appear
- Examples: "What is 5 + 3?", "What is 12 - 7?"
- Verify no exact duplicate appears

**Expected:**
- ✅ All question IDs are unique
- ✅ No visual duplicates (same numbers)

**Pass/Fail:** [ ]

---

### Test 4: Answer Recording ✅

**Steps:**
1. Answer 5 questions (mix of correct and incorrect)
2. **Check console after EACH answer**

**Expected Console Output (per answer):**
```
[Stats] Recorded correct answer for arithmetic_addition
```
or
```
[Stats] Recorded incorrect answer for geometry_perimeter
```

**Verify:**
- ✅ Console log appears after every answer
- ✅ Correct skill ID mentioned
- ✅ Correct/incorrect status matches your answer

**Pass/Fail:** [ ]

---

### Test 5: Stats Persistence ✅

**Steps:**
1. Complete a full training session (10 questions)
2. In console, run:
```javascript
const statsJson = localStorage.getItem('mathbot_skill_stats_v1');
const stats = JSON.parse(statsJson);
console.log('Stats Store:', stats);
```

**Expected:**
- ✅ Stats object exists
- ✅ Has `skills` Map with entries
- ✅ `lastUpdated` is recent timestamp
- ✅ Skills show attempts > 0

**Example Output:**
```javascript
{
  skills: Map {
    'arithmetic_addition' => {
      attempts: 6,
      correct: 4,
      accuracy: 66.67,
      currentStreak: 2,
      masteryScore: 0.45,
      ...
    }
  },
  lastUpdated: 1736726400000,
  version: '1.0.0'
}
```

**Pass/Fail:** [ ]

---

### Test 6: Dashboard Updates ✅

**Steps:**
1. Complete a training session
2. Navigate to **Progress** tab
3. Scroll to "📐 Математические навыки" section (new panel)
4. Wait 2-3 seconds for auto-refresh

**Expected:**
- ✅ New "Math Skills Panel" is visible
- ✅ Shows skills with actual numbers (not zeros)
- ✅ Mastery percentages visible (e.g., "45%")
- ✅ Recent performance bars visible (green/red)
- ✅ Accuracy percentages shown
- ✅ Streak numbers visible

**Visual Check:**
```
➕ Addition
   45% Mastery (Learning)
   Attempts: 6 | Accuracy: 67% | Streak: 2
   Avg Time: 4.2s
   [■■□■■□■□□■] Last 10: 6/10 correct
```

**Pass/Fail:** [ ]

---

### Test 7: Dashboard Auto-Refresh ✅

**Steps:**
1. With Progress tab open (showing Math Skills Panel)
2. Open another tab, same browser
3. Navigate to MathBot Arena
4. Complete another session in the new tab
5. Switch back to Progress tab
6. Watch for updates (within 5 seconds)

**Expected:**
- ✅ Stats automatically update in first tab
- ✅ Numbers increase (attempts, correct)
- ✅ No page refresh needed

**Pass/Fail:** [ ]

---

### Test 8: XP Progress Never >100% ✅

**Steps:**
1. Complete multiple training sessions
2. After each session, check header for XP bar
3. Look for percentage display

**Expected:**
- ✅ XP progress bar never exceeds 100%
- ✅ Text shows "X / Y XP" or percentage ≤100%
- ✅ No weird numbers like "2158%"

**Verify in Console:**
```javascript
const data = JSON.parse(localStorage.getItem('mathbot_arena_v2'));
const level = data.playerBot.level;
const totalXP = data.playerBot.totalXP;

// Calculate expected progress
const xpForCurrentLevel = level > 1 ? (Math.pow(2, level - 1) - 1) * 100 : 0;
const xpForNextLevel = (Math.pow(2, level) - 1) * 100;
const xpInLevel = totalXP - xpForCurrentLevel;
const xpRequired = xpForNextLevel - xpForCurrentLevel;
const progress = (xpInLevel / xpRequired) * 100;

console.log('XP Progress:', progress.toFixed(1) + '%');
console.log('Should be 0-100:', progress >= 0 && progress <= 100);
```

**Pass/Fail:** [ ]

---

### Test 9: Mastery Calculation ✅

**Steps:**
1. Practice same skill multiple times
2. Intentionally get some wrong, some right
3. Check mastery score progression

**Test Scenarios:**

**Scenario A: High Accuracy**
- Answer 10 questions, 9 correct (90%)
- Expected Mastery: ~70-80% (Proficient)

**Scenario B: Medium Accuracy**
- Answer 10 questions, 6 correct (60%)
- Expected Mastery: ~40-50% (Learning)

**Scenario C: Low Accuracy**
- Answer 10 questions, 3 correct (30%)
- Expected Mastery: ~20-30% (Beginner)

**Check in Console:**
```javascript
const service = await import('./engine/questionService.js');
const stats = await service.questionService.exportStats();
console.table(stats.skills);
```

**Verify:**
- ✅ Mastery score reflects accuracy
- ✅ Color coding matches:
  - Green (≥80%)
  - Blue (≥60%)
  - Yellow (≥40%)
  - Red (<40%)

**Pass/Fail:** [ ]

---

### Test 10: Streak Tracking ✅

**Steps:**
1. Answer questions in a pattern:
   - 3 correct in a row
   - 1 incorrect
   - 5 correct in a row
   - 1 incorrect

**Expected:**
- ✅ Current streak resets to 0 after each wrong answer
- ✅ Best streak records highest (5 in this case)
- ✅ Dashboard shows both streaks

**Check in Dashboard:**
- Current Streak: Should be 0 (just got one wrong)
- Best Streak: Should be 5

**Pass/Fail:** [ ]

---

### Test 11: Data Persistence After Refresh ✅

**Steps:**
1. Complete a session
2. Note your stats (attempts, accuracy, mastery)
3. Press F5 to refresh page
4. Navigate back to Progress tab
5. Check Math Skills Panel

**Expected:**
- ✅ All stats persist after refresh
- ✅ Numbers match what you noted
- ✅ No data loss

**Pass/Fail:** [ ]

---

### Test 12: Adaptive Difficulty ✅

**Steps:**
1. Start training session
2. **Note the difficulty of first few questions**
3. Continue answering questions
4. **Note if questions get harder**

**Expected:**
- ✅ Questions start appropriate for age
- ✅ Difficulty gradually increases if doing well
- ✅ Not too easy, not impossibly hard

**Manual Assessment:**
- Early questions (1-3): Easy/Medium
- Mid questions (4-7): Medium
- Late questions (8-10): Medium/Hard

**Pass/Fail:** [ ]

---

### Test 13: Error Handling ✅

**Steps:**
1. Open DevTools Console
2. Run:
```javascript
// Simulate stats loading error
localStorage.removeItem('mathbot_skill_stats_v1');
localStorage.setItem('mathbot_skill_stats_v1', 'INVALID JSON{{{');
location.reload();
```

3. Navigate to Progress tab
4. Check for errors

**Expected:**
- ✅ No crash
- ✅ Graceful error message or empty state
- ✅ Console shows error but app continues

**Recovery:**
```javascript
localStorage.removeItem('mathbot_skill_stats_v1');
location.reload();
```

**Pass/Fail:** [ ]

---

### Test 14: Multiple Sessions ✅

**Steps:**
1. Complete 3 training sessions back-to-back
2. Check dashboard after each session
3. Verify stats accumulate correctly

**Expected After 3 Sessions (~30 questions):**
- ✅ Attempts: ~30
- ✅ Correct: varies (your performance)
- ✅ Accuracy: consistent percentage
- ✅ Mastery: should increase gradually
- ✅ Best streak: highest across all sessions

**Pass/Fail:** [ ]

---

### Test 15: Edge Cases ✅

**Test 15a: Age Boundaries**
1. Create user with age 6 (minimum)
2. Start session
3. Verify questions appropriate for age 6

**Test 15b: Age Boundaries**
1. Create user with age 18 (maximum)
2. Start session
3. Verify questions appropriate for age 18

**Expected:**
- ✅ Both ages work without errors
- ✅ Question difficulty matches age

**Pass/Fail:** [ ]

---

## 🐛 **Debugging Commands**

### Export All Stats:
```javascript
const service = await import('./engine/questionService.js');
const stats = await service.questionService.exportStats();
console.table(stats.skills);
console.log('Total Attempts:', stats.totalAttempted);
console.log('Total Correct:', stats.totalCorrect);
console.log('Overall Accuracy:', stats.overallAccuracy.toFixed(1) + '%');
```

### Check Question Bank:
```javascript
const bankJson = localStorage.getItem('mathbot_question_bank_v1');
const bank = JSON.parse(bankJson);
console.log('Question Bank Size:', bank.length);
console.log('Sample Question:', bank[0]);
```

### Validate Session (No Duplicates):
```javascript
// After starting a session
const session = window.currentSession; // if exposed
const ids = session.questions.map(q => q._questionId);
const unique = new Set(ids);
console.log('Total Questions:', ids.length);
console.log('Unique Questions:', unique.size);
console.log('Has Duplicates:', ids.length !== unique.size);
```

### Clear All Data:
```javascript
const service = await import('./engine/questionService.js');
await service.questionService.clearAllData();
localStorage.clear();
location.reload();
```

---

## 📊 **Success Criteria**

A successful test run should have:
- ✅ All 15 tests passing
- ✅ Zero console errors (except intentional Test 13)
- ✅ Dashboard shows real numbers
- ✅ Stats persist after refresh
- ✅ No duplicate questions observed
- ✅ XP progress always 0-100%

---

## 📝 **Test Report Template**

```
=== MathBot Arena Test Report ===
Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari + version]
OS: [Windows/Mac/Linux]

Test Results:
[ ] Test 1: New User Registration
[ ] Test 2: Session Creation
[ ] Test 3: No Duplicate Questions
[ ] Test 4: Answer Recording
[ ] Test 5: Stats Persistence
[ ] Test 6: Dashboard Updates
[ ] Test 7: Dashboard Auto-Refresh
[ ] Test 8: XP Progress Never >100%
[ ] Test 9: Mastery Calculation
[ ] Test 10: Streak Tracking
[ ] Test 11: Data Persistence After Refresh
[ ] Test 12: Adaptive Difficulty
[ ] Test 13: Error Handling
[ ] Test 14: Multiple Sessions
[ ] Test 15: Edge Cases

Total Passing: X/15
Total Failing: Y/15

Issues Found:
1. [Description]
2. [Description]

Notes:
- [Additional observations]
```

---

## 🔧 **Troubleshooting**

### Issue: Dashboard Shows Zeros
**Solution:**
```javascript
// Check if stats exist
const statsJson = localStorage.getItem('mathbot_skill_stats_v1');
console.log('Stats:', statsJson ? 'EXISTS' : 'MISSING');

// If missing, play a session first
// If exists but zeros, check console for [Stats] logs
```

### Issue: Console Shows Errors
**Solution:**
1. Note the error message
2. Check if it's from old or new system
3. Clear localStorage and retry
4. Report to developer with full error stack

### Issue: Questions Repeat
**Solution:**
1. **CRITICAL - Document immediately**
2. Note which questions repeated
3. Check console for validation errors
4. Export session data:
```javascript
const data = JSON.parse(localStorage.getItem('mathbot_arena_v2'));
console.log('Last Session:', data);
```

---

## ✅ **Completion Checklist**

After completing all tests:
- [ ] All 15 tests executed
- [ ] Results documented
- [ ] Issues reported (if any)
- [ ] Test report saved
- [ ] Browser console logs captured (if errors)
- [ ] LocalStorage data exported (if issues)

---

**Happy Testing! 🎉**

*For questions, refer to IMPLEMENTATION_SUMMARY.md or README.md DEV NOTES.*
