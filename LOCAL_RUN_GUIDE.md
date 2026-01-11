# 🚀 MathBot Arena - Local Run Guide

**Updated: 2026-01-11**
**Build Tag: v2.0-PVP-WIRED**

This guide provides exact, copy-paste-ready commands to run MathBot Arena locally with full PvP support.

---

## ✅ What's Been Fixed

1. **PvP Arena is now accessible** - Added "🎮 PvP Арена" tab to main UI
2. **Documentation corrected** - All ports and URLs verified and documented
3. **Environment variables configured** - .env files created with correct values
4. **Build marker added** - Version tag visible in UI (v2.0-PVP-WIRED)
5. **Convenience scripts added** - Easy commands to run server and client

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

## 🎮 Testing PvP Arena

### 1. Open Two Browser Windows

- **Window 1:** http://localhost:3000
- **Window 2:** http://localhost:3000 (open in incognito/private mode)

### 2. Register Heroes

In **both windows**:
1. Click "🚀 Начать приключение"
2. Fill in registration:
   - Name: Player1 / Player2
   - Age: 10 (or any age 6-18)
   - Email: test1@example.com / test2@example.com
3. Click "✅ Создать героя"

### 3. Enter PvP Arena

In **both windows**:
1. Click on the **"🎮 PvP Арена"** tab (third tab in the navigation)
2. You should see:
   - Your hero stats (name, level, rank, HP, skills)
   - Warning about server requirement
   - "🎮 Начать бой!" button

### 4. Start Battle

In **both windows**:
1. Click "🎮 Начать бой!"
2. Wait for matchmaking (should take 2-5 seconds)
3. Battle begins!

### 5. Play the Battle

- **Answer questions** by clicking one of 4 answer options
- **Watch the timer** (45 seconds per question)
- **See opponent's status** (HP bar, answered indicator)
- **Use ultimate** when charge reaches 100%
- **Battle ends** when one player's HP reaches 0 or after 10 rounds

---

## 🔍 Verification Checklist

Use this checklist to verify everything is working:

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
- [ ] Build tag visible: "v2.0-PVP-WIRED" in header
- [ ] All tabs accessible: Тренировка, Обучение, **PvP Арена**, Статистика, Материалы, Профиль
- [ ] PvP Arena tab shows hero stats
- [ ] "Начать бой!" button is visible and clickable

### WebSocket Connection Verification

Open browser console (F12) and check for:
- [ ] "🔌 Connected to battle server: [socket-id]"
- [ ] No WebSocket connection errors
- [ ] Server URL shown: http://localhost:3001

### Battle Flow Verification

- [ ] Matchmaking finds opponent (2 windows)
- [ ] Loading screen appears (3 seconds)
- [ ] Question displays correctly
- [ ] Timer counts down from 45
- [ ] Answer submission works
- [ ] "Opponent answered" indicator appears
- [ ] Round result animation plays
- [ ] HP bars update correctly
- [ ] Battle ends with victory/defeat screen
- [ ] Rewards are shown (XP, rank change, coins)
- [ ] Stats are displayed (accuracy, response time)

---

## 🐛 Troubleshooting

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

### Problem: Client won't start

**Error:** `Port 3000 already in use`

**Solution:**
```bash
# Vite will automatically try next port
# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
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

### Problem: Matchmaking stuck

**Symptoms:**
- "Finding opponent..." forever
- Queue position doesn't change

**Solution:**
1. Check both players are in the queue (server logs)
2. Verify same age category (child/teen/adult)
3. Wait at least 10 seconds
4. Check server stats: `curl http://localhost:3001/stats`

### Problem: Battle questions not loading

**Symptoms:**
- "undefined" or blank questions
- Battle freezes after loading

**Solution:**
1. Check `src/data/taskBank.ts` is loaded
2. Verify no TypeScript errors: `npm run type-check`
3. Clear localStorage: Browser DevTools → Application → Local Storage → Clear
4. Refresh page

### Problem: Can't see PvP Arena tab

**Symptoms:**
- Only 5 tabs visible (no PvP tab)

**Solution:**
1. Verify build tag shows "v2.0-PVP-WIRED" in header
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check you're on correct branch: `git branch` (should show claude/review-math-bot-arena-OLrBM)
4. Verify file changes: `git diff HEAD~1 src/MathBotArena.tsx`

---

## 📊 Ports Summary

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Vite Dev Server** | 3000 | http://localhost:3000 | React client UI |
| **WebSocket Server** | 3001 | http://localhost:3001 | PvP battle server |
| **Health Check** | 3001 | http://localhost:3001/health | Server status |
| **Stats Endpoint** | 3001 | http://localhost:3001/stats | Queue & battles |

---

## 📁 Files Changed Summary

### Modified Files

1. **`src/MathBotArena.tsx`**
   - Added 'pvp' to screen and activeTab types
   - Imported BattleArena and createBattleHero
   - Added PvP tab to navigation
   - Created PvP info screen with hero stats
   - Integrated BattleArena component
   - Added BUILD_TAG constant: 'v2.0-PVP-WIRED'
   - Display build tag in header

2. **`package.json`**
   - Added `dev:server` script
   - All dependencies already present

3. **`README.md`**
   - Updated Quick Start with two-terminal setup
   - Added PvP features to key features list
   - Updated architecture section
   - Added environment configuration docs
   - Added links to PvP documentation

### Created Files

1. **`.env.example`**
   - Template for environment variables
   - VITE_SERVER_URL configuration

---

## 🎯 Expected Behavior

### Normal Operation

1. **Server starts** (Terminal 1):
   - Shows ASCII art logo
   - Port 3001 listening
   - "WebSocket: Socket.io" status
   - "Battle System: ACTIVE"
   - "Matchmaking: RUNNING"

2. **Client starts** (Terminal 2):
   - Vite dev server on port 3000
   - Opens browser automatically
   - Shows welcome screen
   - Build tag visible: v2.0-PVP-WIRED

3. **Registration works**:
   - Form submits successfully
   - Hero created with stats
   - Redirects to game screen
   - localStorage saves data

4. **PvP Arena accessible**:
   - Tab appears in navigation
   - Hero stats display correctly
   - "Начать бой!" button works
   - Battle screen loads

5. **Matchmaking functions**:
   - Queue position updates
   - Match found within 10 seconds (with 2 players)
   - Loading screen (3 seconds)
   - Battle begins

6. **Battle plays**:
   - Questions load correctly
   - Timer counts down
   - Answers submit
   - Damage calculates
   - HP updates smoothly
   - Animations play
   - Battle ends correctly

7. **Rewards apply**:
   - XP added to hero
   - Level updates if threshold reached
   - Rank changes
   - Returns to game screen

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
git log --oneline -5     # Last 5 commits
git diff HEAD~1          # Changes in last commit
```

---

## 🎓 Next Steps

Once local setup is working:

1. **Test all features**:
   - Training mode
   - Learning mode
   - Statistics
   - Guides
   - PvP Arena

2. **Try different scenarios**:
   - Different age categories (child/teen/adult)
   - Different skill levels
   - Ultimate abilities
   - Disconnect/reconnect
   - Multiple rounds

3. **Performance testing**:
   - Open 4+ browser windows
   - Run multiple battles simultaneously
   - Check server performance with `curl http://localhost:3001/stats`

4. **Deploy to production**:
   - See [Deployment Guide](./PVP_IMPLEMENTATION_SUMMARY.md#deployment-readiness)
   - Server: Heroku, AWS, DigitalOcean
   - Client: Vercel, Netlify, AWS S3

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
- Access PvP Arena from the main UI
- Battle with another player in two browser windows

**Build Tag:** v2.0-PVP-WIRED
**Last Updated:** 2026-01-11

</div>
