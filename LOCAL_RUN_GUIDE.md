# 🚀 MathBot Arena - Local Run Guide

**Updated: 2026-01-11**
**Build Tag: v2.1-AVATAR-SKILLS**

This guide provides exact, copy-paste-ready commands to run MathBot Arena locally with full Avatar System, gamification features, and PvP support.

---

## ✅ What's New in v2.1-AVATAR-SKILLS

### PHASE 1 - Avatar System
1. **Complete Avatar System** - 4 base types (Scholar, Warrior, Artist, Engineer)
2. **Avatar Selection** - Onboarding flow after registration
3. **Skills Dashboard** - Core skills (6), secondary skills (16), unique perks
4. **Visual Avatar** - SVG-based rendering with Framer Motion animations
5. **Mini/Large Display** - Avatar in header and profile
6. **i18n System** - Full RU/EN translations for all UI strings
7. **Skill History** - Timeline of skill changes with events

### PHASE 2 - Gamification (Core Systems)
1. **SessionManager** - Fixes tab-switching bug with pause/resume
2. **Scoring System** - Speed coefficient (1.00-1.15), difficulty multipliers
3. **Skill Gain** - XP distribution to core/secondary skills
4. **Skill Decay** - 5-day grace, 20% max decay over 7 days
5. **Daily Quests** - 3 random quests with rewards
6. **Streak Tracking** - Consecutive days with freeze option

### Previous Features (v2.0)
1. **PvP Arena** - Real-time battles via WebSocket
2. **Training/Learning Modes** - Adaptive difficulty
3. **Statistics** - Comprehensive progress tracking

---

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** (for cloning)

Check your versions:
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

---

## 🎯 Quick Start (Copy-Paste Ready)

### Step 1: Clone and Install

```bash
# Clone repository (if you haven't already)
git clone <repository-url>
cd MATHBOT

# Install client dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Step 2: Verify Configuration

The following files should exist with these contents:

**`.env` (root directory):**
```env
VITE_SERVER_URL=http://localhost:3001
```

**`server/.env` (copy from server/.env.example):**
```bash
cp server/.env.example server/.env
```

Content of `server/.env`:
```env
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Run the Application

You need **TWO TERMINALS**:

**Terminal 1 - WebSocket Server:**
```bash
cd server
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════════════╗
║       ⚔️  MathBot Arena Server v1.0 ⚔️        ║
║  Status: ONLINE                               ║
║  Port: 3001                                   ║
╚═══════════════════════════════════════════════╝
```

**Terminal 2 - Vite Client:**
```bash
npm run dev
```

Expected output:
```
  VITE v5.2.11  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 🎨 Testing Avatar System

### 1. Register and Create Avatar

1. Open http://localhost:3000
2. Click "🚀 Начать приключение"
3. Fill registration:
   - Name: Player1
   - Age: 10 (or any age 6-18)
   - Email: test@example.com
4. Click "✅ Создать героя"
5. **Avatar Selection** screen appears

### 2. Choose Your Avatar

You'll see 4 avatar types:

- **🧠 Scholar (Учёный)** - Bonus to arithmetic & accuracy
- **⚔️ Warrior (Воин)** - Bonus to speed & focus
- **🎨 Artist (Художник)** - Bonus to geometry & logic
- **🔧 Engineer (Инженер)** - Balanced stats

Click one to select, then customize:
- Hair style (6 options)
- Color palette

Click "Создать" to finish.

### 3. Explore Skills Dashboard

1. Click on **"✨ Навыки"** tab
2. You'll see:
   - **Core Skills** (6): Progress bars for arithmetic, geometry, logic, speed, accuracy, focus
   - **Secondary Skills** (16): Addition, subtraction, shapes, patterns, etc.
   - **Unique Perks**: Unlockable abilities (empty at start)
   - **Skill History**: Timeline of changes
   - **Summary**: Level, streak, rating, PvP rank

### 4. Check Avatar Display

- **Header**: Mini avatar (64px) next to your name
- **Profile Tab**: Large avatar (192px) with full stats
- **Animations**: Idle breathing, blinking eyes, aura pulsing

### 5. Language Switcher

- Click **🌐 RU/EN** button in header
- All UI text switches instantly
- Choice saved to localStorage

---

## 🎮 Testing PvP Arena

### 1. Open Two Browser Windows

- **Window 1:** http://localhost:3000
- **Window 2:** http://localhost:3000 (open in incognito/private mode)

### 2. Register Heroes

In **both windows**:
1. Register as usual
2. Select different avatars (Scholar vs Warrior, etc.)
3. Complete setup

### 3. Enter PvP Arena

In **both windows**:
1. Click on **"🎮 PvP Арена"** tab
2. Your avatar appears in the battle UI
3. Click "🎮 Начать бой!"

### 4. Battle Flow

- Questions appear for both players
- Answer to deal damage
- Watch opponent's avatar take damage
- Use ultimate abilities
- Battle ends when one avatar's HP reaches 0

---

## 🔍 Verification Checklist

### Avatar System Verification

- [ ] Registration leads to avatar selection
- [ ] 4 avatar types displayed with descriptions
- [ ] Customization panel shows hair styles
- [ ] Mini avatar visible in header
- [ ] Large avatar visible in profile
- [ ] Skills tab accessible
- [ ] Core skills (6) displayed with progress bars
- [ ] Secondary skills (16) displayed in grid
- [ ] Skill history empty initially
- [ ] Build tag shows: "v2.1-AVATAR-SKILLS"

### i18n Verification

- [ ] Language switcher visible in header
- [ ] Click switches between RU/EN
- [ ] All UI text translates (tabs, buttons, labels)
- [ ] Avatar names translate (Scholar = Учёный)
- [ ] Skills translate (Arithmetic = Арифметика)
- [ ] Language persists after refresh

### Server Verification

- [ ] Server starts without errors
- [ ] Port 3001 is listening
- [ ] No CORS errors in server logs
- [ ] Health check works: `curl http://localhost:3001/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "uptime": 12.34,
  "queue": { "child": 0, "teen": 0, "adult": 0 },
  "activeBattles": 0
}
```

### Client Verification

- [ ] Client starts on port 3000
- [ ] No console errors in browser
- [ ] Build tag visible: "v2.1-AVATAR-SKILLS" in header
- [ ] All tabs accessible: Тренировка, Обучение, PvP Арена, **✨ Навыки**, Статистика, Материалы, Профиль
- [ ] Avatar system loads correctly
- [ ] Animations play smoothly (Framer Motion)

### localStorage Verification

Open Browser DevTools → Application → Local Storage → http://localhost:3000

Check for:
- [ ] `mathbot_arena_v2` - Main player data
- [ ] `mathbot_language` - Language preference (ru/en)
- [ ] Player data includes `avatarProfile` object

---

## 🐛 Troubleshooting

### Problem: Avatar selection doesn't appear

**Symptoms:**
- Registration works but goes directly to game
- No avatar selection screen

**Solution:**
1. Clear localStorage: DevTools → Application → Local Storage → Clear All
2. Refresh page (Ctrl+Shift+R)
3. Register again
4. Verify screen state: check console for errors

### Problem: Skills tab shows "No avatar" message

**Symptoms:**
- Skills tab shows "Сначала выберите аватар!"
- Even after selecting avatar

**Solution:**
1. Check localStorage for `avatarProfile` in player data
2. Clear localStorage and re-register
3. Verify avatar selection completed (clicked "Создать")
4. Check console for TypeScript errors

### Problem: Avatar doesn't render (blank space)

**Symptoms:**
- Header shows blank space instead of avatar
- Profile shows blank space

**Solution:**
1. Check browser console for SVG errors
2. Verify Framer Motion is installed: `npm list framer-motion`
3. Clear cache and reload
4. Check if `AvatarView.tsx` loaded correctly

### Problem: Language switcher doesn't work

**Symptoms:**
- Clicking language switcher does nothing
- Text doesn't translate

**Solution:**
1. Check console for i18n errors
2. Verify `I18nProvider` wraps app
3. Check translations file loaded: `src/i18n/translations.ts`
4. Clear localStorage `mathbot_language` key

### Problem: Server won't start

**Error:** `Port 3001 already in use`

**Solution:**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or on Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Problem: TypeScript errors in build

**Error:** "Cannot find module 'react' or its corresponding type declarations"

**Solution:**
```bash
# Re-install dependencies
npm install

# Check for peer dependency issues
npm install react@^18.2.0 react-dom@^18.2.0

# Run type check
npm run type-check
```

### Problem: WebSocket connection fails

**Symptoms:**
- Console shows: "Socket not connected"
- No matchmaking happening

**Solution:**
1. Check server is running: `curl http://localhost:3001/health`
2. Verify `.env` has correct URL: `VITE_SERVER_URL=http://localhost:3001`
3. Clear browser cache and reload
4. Check browser console for CORS errors

### Problem: Skill gains not working

**Symptoms:**
- Complete tasks but skills don't increase
- No skill history events

**Solution:**
1. Verify avatar profile exists in playerBot state
2. Check console for skill gain errors
3. Ensure `applySkillGains()` is called after correct answers
4. Integration pending (PHASE 2 systems not yet wired to main app)

---

## 📊 Ports Summary

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Vite Dev Server** | 3000 | http://localhost:3000 | React client UI |
| **WebSocket Server** | 3001 | http://localhost:3001 | PvP battle server |
| **Health Check** | 3001 | http://localhost:3001/health | Server status |
| **Stats Endpoint** | 3001 | http://localhost:3001/stats | Queue & battles |

---

## 📁 New Files Summary (v2.1)

### PHASE 1 - Avatar System

#### Avatar Core (src/avatar/)
- `types.ts` - Complete type system, AVATAR_BASES config, helpers
- `AvatarView.tsx` - SVG-based visual rendering with animations
- `AvatarSelection.tsx` - Two-step onboarding flow
- `SkillsDashboard.tsx` - Skills visualization panel

#### i18n System (src/i18n/)
- `config.ts` - Language management (RU/EN)
- `context.tsx` - React context with useI18n hook
- `translations.ts` - Complete RU/EN dictionaries (600+ keys)

#### Components (src/components/)
- `LanguageSwitcher.tsx` - 🌐 Globe button to switch languages

### PHASE 2 - Gamification (Core Systems)

#### Session Management (src/session/)
- `SessionManager.tsx` - Global session state, pause/resume modal

#### Scoring (src/scoring/)
- `scoring.ts` - Speed coefficient, difficulty multipliers, XP calculation

#### Skills (src/skills/)
- `skillGain.ts` - Task → skill mapping, XP distribution
- `skillDecay.ts` - Decay algorithm, grace period, warning system

#### Quests (src/quests/)
- `dailyQuests.ts` - Daily quests generation, streak tracking, rewards

**Total New Files:** 13
**Total New Lines:** ~3,500+

---

## 🎯 Expected Behavior

### Normal Operation with Avatar System

1. **Server starts** (Terminal 1):
   - Shows ASCII art logo
   - Port 3001 listening
   - "WebSocket: Socket.io" status
   - "Battle System: ACTIVE"

2. **Client starts** (Terminal 2):
   - Vite dev server on port 3000
   - Opens browser automatically
   - Shows welcome screen
   - Build tag visible: **v2.1-AVATAR-SKILLS**

3. **Registration → Avatar Selection**:
   - Form submits successfully
   - Redirects to Avatar Selection screen
   - Shows 4 avatar types with previews
   - Customization panel appears on selection
   - Saves to localStorage with avatarProfile

4. **Game Screen with Avatar**:
   - Mini avatar in header (animated)
   - All 7 tabs accessible (including ✨ Навыки)
   - Language switcher functional
   - Avatar persists across page refreshes

5. **Skills Dashboard**:
   - Core skills displayed with progress bars
   - Secondary skills in grid layout
   - Unique perks section (empty initially)
   - Skill history empty at start
   - Summary stats (level, streak, rating, PvP rank)

6. **Profile Tab**:
   - Large avatar (192px) with animations
   - Full stats displayed
   - User info (name, age, email)
   - XP progress bar
   - Level and total sessions

7. **Language Switching**:
   - Click 🌐 button
   - All text translates instantly
   - Avatar names translate
   - Skill names translate
   - Persists to localStorage

---

## 📝 Environment Variables Reference

### Client (.env)

```env
# Required for PvP Arena
VITE_SERVER_URL=http://localhost:3001

# Optional: Override Vite port (default: 3000)
# VITE_PORT=3000
```

### Server (server/.env)

```env
# Server port
PORT=3001

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Battle configuration (optional)
QUESTION_TIME_LIMIT=45
MAX_ROUNDS=10
DISCONNECT_TIMEOUT=30
MATCHMAKING_INTERVAL=2000
ELO_K_FACTOR=32
```

---

## 🔧 Useful Commands

### Development

```bash
# Start everything
npm run dev              # Client (in root)
npm run dev:server       # Server (from root, runs cd server && npm run dev)

# Or manually:
cd server && npm run dev # Server (in server/)
npm run dev              # Client (in root)

# Build
npm run build            # Client production build
cd server && npm run build # Server production build

# Type check
npm run type-check       # Check TypeScript types

# Lint
npm run lint             # Check code style
```

### Server Only

```bash
cd server

# Development
npm run dev              # Watch mode with auto-reload

# Production
npm run build            # Compile TypeScript
npm start                # Run compiled server

# Debug
curl http://localhost:3001/health  # Health check
curl http://localhost:3001/stats   # Queue & battles stats
```

### Git

```bash
# Check branch
git branch               # Should show: claude/review-math-bot-arena-OLrBM

# Pull latest changes
git pull origin claude/review-math-bot-arena-OLrBM

# Check what changed
git log --oneline -10    # Last 10 commits
git diff HEAD~1          # Changes in last commit
```

---

## 🎓 Next Steps

Once local setup is working:

1. **Test all Avatar features**:
   - Create avatars with different types
   - Check mini/large display
   - Test language switching
   - Explore skills dashboard
   - Complete training sessions

2. **Test Gamification** (systems created, integration pending):
   - Scoring calculations
   - Skill gains after tasks
   - Skill decay warnings
   - Daily quests (when integrated)
   - Streak tracking (when integrated)

3. **Test PvP with Avatars**:
   - Battle with different avatar types
   - Check avatar display in battle UI
   - Test ultimate abilities
   - Verify rewards apply to skills

4. **Performance testing**:
   - Open 4+ browser windows
   - Create different avatars
   - Switch languages rapidly
   - Check animation performance

5. **Deploy to production**:
   - Build client: `npm run build`
   - Build server: `cd server && npm run build`
   - Deploy to hosting (Vercel, Netlify, AWS, etc.)

---

## 📊 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Avatar System** | ✅ Complete | 4 types, visual rendering, skills |
| **Skills Dashboard** | ✅ Complete | Core/secondary skills, history |
| **i18n RU/EN** | ✅ Complete | Full translations, language switcher |
| **SessionManager** | ✅ Created | Context ready, needs integration |
| **Scoring System** | ✅ Created | Speed coefficient, multipliers |
| **Skill Gain** | ✅ Created | Task mapping, XP distribution |
| **Skill Decay** | ✅ Created | 5-day grace, 20% max decay |
| **Daily Quests** | ✅ Created | 3 quests, rewards, streak |
| **PvP Arena** | ✅ Working | Real-time battles |
| **Training/Learning** | ✅ Working | Adaptive difficulty |

**Build Progress:** PHASE 1 ✅ Complete | PHASE 2 Core ✅ Complete | Integration Pending

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check server logs (Terminal 1)
2. Check browser console (F12)
3. Verify environment variables
4. Clear cache and localStorage
5. Restart both server and client

For bug reports:
- Email: info@y7agency.com
- Telegram: [@sergiivoo](https://t.me/sergiivoo)

---

<div align="center">

**✅ Setup Complete!**

You should now be able to:
- Run the client on http://localhost:3000
- Run the server on http://localhost:3001
- Create and customize avatars
- View skills dashboard
- Switch languages (RU/EN)
- Access PvP Arena with avatars
- Battle with another player

**Build Tag:** v2.1-AVATAR-SKILLS
**Last Updated:** 2026-01-11

</div>
