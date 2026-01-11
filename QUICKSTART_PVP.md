# ⚔️ MathBot Arena PvP - Quick Start Guide

Complete implementation of real-time multiplayer battles where players compete by solving math problems.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Running the System](#running-the-system)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The PvP Arena system allows two players to battle in real-time by answering math questions. The first player to answer correctly deals damage to their opponent based on:

- **Question difficulty** (1-6): Base damage 10-60
- **Answer speed**: Up to +50% bonus for ultra-fast answers
- **Skill levels**: Attack/defense/speed multipliers
- **Combat mechanics**: Critical hits, dodges, blocks
- **Ultimate abilities**: Special powers unique to each archetype

### Key Features

✅ **Real-time matchmaking** with rank-based pairing
✅ **10-round battles** with 45 seconds per question
✅ **4 archetypes** with unique ultimate abilities
✅ **ELO rating system** for competitive ranking
✅ **Battle replay** system for reviewing matches
✅ **Disconnect handling** with 30-second timeout
✅ **Responsive UI** for all devices

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React)                       │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │ BattleArena.tsx│ ◄─────► │ useBattleSocket.ts   │   │
│  │  (UI & State)  │         │  (WebSocket Hook)    │   │
│  └────────────────┘         └──────────────────────┘   │
│                                       │                  │
└───────────────────────────────────────┼──────────────────┘
                                        │ Socket.io
                                        │
┌───────────────────────────────────────▼──────────────────┐
│                   Server (Node.js)                        │
│  ┌────────────────┐         ┌──────────────────────┐    │
│  │ BattleManager  │ ◄─────► │ battleMechanics.ts   │    │
│  │ (Orchestrator) │         │  (Damage Calc)       │    │
│  └────────────────┘         └──────────────────────┘    │
│         │                                                 │
│         ├─► Matchmaking Queue (child/teen/adult)        │
│         ├─► Active Battles Map                           │
│         └─► ELO Rating Calculator                        │
└──────────────────────────────────────────────────────────┘
```

### File Structure

```
MATHBOT/
├── server/                          # WebSocket Server
│   ├── index.ts                     # Express + Socket.io setup
│   ├── battleManager.ts             # Battle orchestration
│   ├── types.ts                     # Type definitions
│   ├── package.json                 # Server dependencies
│   └── README.md                    # Server documentation
│
├── src/
│   ├── battle/
│   │   └── battleMechanics.ts       # Damage formulas & logic
│   ├── components/
│   │   └── BattleArena.tsx          # Main battle UI
│   ├── hooks/
│   │   └── useBattleSocket.ts       # WebSocket client hook
│   └── data/
│       └── taskBank.ts              # 300+ math questions
│
└── PVP_ARENA_DESIGN.md              # Complete design doc
```

---

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Install Dependencies

```bash
# Install client dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment

Create `server/.env` from template:

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Create `.env` in project root for client:

```bash
# In project root
echo "VITE_SERVER_URL=http://localhost:3001" > .env
```

---

## 🚀 Running the System

### Development Mode

Open **two terminals**:

**Terminal 1: Start Server**
```bash
cd server
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════╗
║       ⚔️  MathBot Arena Server v1.0 ⚔️        ║
║  Status: ONLINE                               ║
║  Port: 3001                                   ║
╚═══════════════════════════════════════════════╝
```

**Terminal 2: Start Client**
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Mode

```bash
# Build server
cd server
npm run build
npm start

# Build client
cd ..
npm run build
npm run preview
```

---

## 🎮 How It Works

### 1. Matchmaking

```typescript
// Player joins queue
findMatch(hero, rank, ageCategory);

// Server matches players based on:
// - Same age category (child 6-11, teen 12-15, adult 16-18)
// - Rank difference < 100
// - Level difference < 5
// - Lower wait time = more flexible matching
```

**Matchmaking Score Formula:**
```typescript
score = (rankDiff × 2) + (levelDiff × 5)

// After 30s: score × 0.7
// After 60s: score × 0.5
```

### 2. Battle Flow

```
┌──────────────┐
│ MATCHMAKING  │ ──► Queue position shown
└──────┬───────┘
       │ Match found!
       ▼
┌──────────────┐
│   LOADING    │ ──► 3-second countdown
└──────┬───────┘
       │ Both players ready
       ▼
┌──────────────┐
│   ROUND 1    │ ──► 45-second timer
│  (Question)  │     4 answer options
└──────┬───────┘
       │ Both answered
       ▼
┌──────────────┐
│  RESOLUTION  │ ──► Damage calculation
│  (Animation) │     HP update
└──────┬───────┘
       │ HP > 0?
       ├─YES──► ROUND 2
       │
       └─NO───┐
              ▼
       ┌──────────────┐
       │  BATTLE END  │ ──► Rewards + Stats
       └──────────────┘
```

### 3. Damage Calculation

```typescript
// 11-Step Damage Formula
1. Base Damage = difficulty × 10 (10-60)
2. Attack Multiplier = 1 + (attack / 100)
3. Speed Bonus = 0.9 to 1.5 (based on answer time)
4. Skill Bonus = 1.2 if question type matches specialty
5. Combo Multiplier = 1 + (combo × 0.05)
6. Buff Effects = from active buffs
7. Critical Hit = ×1.5 (based on crit rate)
8. Defense Reduction = 1 - (def / (def + 100))
9. Dodge Check = 0 damage if successful (based on speed)
10. Block Check = 50% reduction if successful (based on defense)
11. Final Damage = Math.floor(damage)
```

**Example Calculation:**
```
Question: "7 × 8" (difficulty 3)
Player A answered in 5 seconds (ultra fast)
Player A: Warrior (high attack)

Base: 3 × 10 = 30 damage
Attack: 30 × 1.20 = 36 (20% attack bonus)
Speed: 36 × 1.5 = 54 (+50% ultra fast)
Critical: 54 × 1.5 = 81 (rolled crit!)
Defense: 81 × 0.7 = 57 (30% reduction)
Block: NO (opponent didn't roll block)

Final: 57 damage!
```

### 4. Ultimate Skills

Each archetype has a unique ultimate (charges to 100%):

**Scholar: Perfect Calculation**
- Effect: Doubles combo multiplier for 3 rounds
- Charge: +20 per win, +5 per loss

**Warrior: Lightning Strike**
- Effect: Instant 30% max HP damage
- Bypasses all defenses

**Artist: Spatial Vision**
- Effect: Guaranteed critical hits next 2 attacks
- 150% damage guaranteed

**Engineer: Calculation Engine**
- Effect: 20% HP shield + 50% attack boost for 3 rounds
- Can overheal up to max HP

### 5. Round Resolution

```typescript
if (p1Correct && !p2Correct) {
  // P1 attacks P2
  damage = calculateDamage(p1, p2, question, p1Time);
  p2.HP -= damage;
  p1.combo++;
  p2.combo = 0;
}
else if (p1Correct && p2Correct) {
  // Faster player attacks
  if (p1Time < p2Time) {
    // P1 wins speed race
  }
}
else if (!p1Correct && !p2Correct) {
  // Draw - no damage
  p1.combo = 0;
  p2.combo = 0;
}
```

### 6. ELO Rating

```typescript
// Expected win probability
expectedWinner = 1 / (1 + 10^((loserRank - winnerRank) / 400))

// Rating change
winnerChange = kFactor × (1 - expectedWinner)
loserChange = kFactor × (0 - expectedLoser)

// kFactor = 32 (standard)
```

**Example:**
- Winner Rank: 1500, Loser Rank: 1600
- Expected: 0.36 (36% chance to win)
- Change: +20 winner, -20 loser

**Rank Tiers:**
- Bronze: 0-999
- Silver: 1000-1999
- Gold: 2000-2999
- Platinum: 3000-3999
- Diamond: 4000-4999
- Master: 5000-5999
- Legend: 6000+

---

## 🔌 API Reference

### Client → Server Messages

#### Find Match
```typescript
socket.emit('message', {
  type: 'FIND_MATCH',
  payload: {
    userId: 'user123',
    heroData: battleHero,
    rank: 1500,
    ageCategory: 'teen'
  }
});
```

#### Submit Answer
```typescript
socket.emit('message', {
  type: 'SUBMIT_ANSWER',
  payload: {
    battleId: 'battle_xyz',
    answer: 56,
    timeTaken: 12.5
  }
});
```

#### Use Ultimate
```typescript
socket.emit('message', {
  type: 'USE_ULTIMATE',
  payload: { battleId: 'battle_xyz' }
});
```

### Server → Client Messages

#### Match Found
```typescript
socket.on('message', (msg) => {
  if (msg.type === 'MATCH_FOUND') {
    console.log('Battle ID:', msg.payload.battleId);
    console.log('Opponent:', msg.payload.opponent);
  }
});
```

#### Battle Start
```typescript
socket.on('message', (msg) => {
  if (msg.type === 'BATTLE_START') {
    const { round, question, timeLimit } = msg.payload;
    // Display question
  }
});
```

#### Round Result
```typescript
socket.on('message', (msg) => {
  if (msg.type === 'ROUND_RESULT') {
    const { result, player1HP, player2HP, animation } = msg.payload;
    // Play animation
    // Update HP bars
  }
});
```

---

## 🧪 Testing

### Manual Testing

**Test Matchmaking:**
1. Open two browser windows
2. Create heroes in both
3. Click "Find Match" in both
4. Should match within 5 seconds

**Test Battle:**
1. Answer questions in both windows
2. Verify damage calculation
3. Check HP updates
4. Test timeout (wait 45 seconds)

**Test Ultimate:**
1. Win 5 rounds (100% charge)
2. Click "ULTIMATE!" button
3. Verify effect applies

**Test Disconnect:**
1. Close one browser window mid-battle
2. Other player should see "Opponent disconnected"
3. Auto-win after 30 seconds

### Server Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "uptime": 123.45,
  "queue": {
    "child": 0,
    "teen": 2,
    "adult": 0
  },
  "activeBattles": 1
}
```

### Automated Testing

```bash
# Server tests (when implemented)
cd server
npm test

# Client tests (when implemented)
npm test
```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** "Socket not connected"

**Solution:**
1. Check server is running: `curl http://localhost:3001/health`
2. Verify `VITE_SERVER_URL` in client `.env`
3. Check CORS settings in `server/index.ts`

### Matchmaking Stuck

**Problem:** "Finding opponent..." forever

**Solution:**
1. Open server logs - check queue status
2. Try different age category
3. Wait 60 seconds (criteria widens)
4. Test with second player

### Damage Not Calculating

**Problem:** HP not updating after answers

**Solution:**
1. Check both players answered
2. Verify question has correct `skillType`
3. Check server logs for errors
4. Ensure `battleMechanics.ts` imported correctly

### Ultimate Not Working

**Problem:** Ultimate button disabled

**Solution:**
1. Check charge >= 100%
2. Verify battle is active
3. Check server received message
4. Look for console errors

### Questions Not Loading

**Problem:** "undefined" or blank questions

**Solution:**
1. Verify `taskBank.ts` loaded
2. Check `getTaskByDifficulty()` returns valid task
3. Ensure difficulty range 1-6
4. Check `skillType` added to tasks

---

## 📈 Performance Tips

### Server Optimization

```typescript
// Adjust matchmaking interval
MATCHMAKING_INTERVAL=1000 // 1 second (faster matching)

// Adjust timeouts
QUESTION_TIME_LIMIT=30 // 30 seconds (faster battles)
DISCONNECT_TIMEOUT=20  // 20 seconds (quicker auto-win)
```

### Client Optimization

```typescript
// Reduce animation duration
animation.duration = 1000 // 1 second instead of 2

// Disable heavy effects on mobile
const isMobile = window.innerWidth < 768;
if (isMobile) {
  // Reduce particle effects
  // Simplify animations
}
```

---

## 🎨 Customization

### Adding New Archetypes

1. **Update `src/data/avatars.ts`:**
```typescript
export const AVATAR_ARCHETYPES = [
  // ... existing
  {
    id: 'ninja',
    name: { en: 'Ninja', ru: 'Ниндзя' },
    ultimateSkill: {
      name: { en: 'Shadow Clone' },
      description: { en: 'Double damage next attack' }
    }
  }
];
```

2. **Add Ultimate in `src/battle/battleMechanics.ts`:**
```typescript
export const ULTIMATE_SKILLS = {
  // ... existing
  ninja: {
    effect: (user, target) => {
      // Implementation
    }
  }
};
```

### Adding More Questions

Edit `src/data/taskBank.ts`:
```typescript
{
  q: '12 × 12',
  a: 144,
  t: 'Умножение',
  e: '12² = 144',
  d: 4,
  time: 45,
  skillType: 'arithmetic'
}
```

---

## 📚 Next Steps

1. **Implement Replay System**
   - Save battle events to database
   - Build replay viewer UI
   - Add share functionality

2. **Advanced Animations**
   - Three.js/PixiJS integration
   - Particle effects for attacks
   - Character animations
   - Camera shake effects

3. **Leaderboards**
   - Global rankings
   - Friends rankings
   - Weekly tournaments

4. **Team Battles**
   - 2v2 mode
   - Team rankings
   - Voice chat integration

---

## 📧 Support

- **Email:** info@y7agency.com
- **Telegram:** [@sergiivoo](https://t.me/sergiivoo)
- **Issues:** [GitHub Issues](https://github.com/yourusername/mathbot-arena/issues)

---

<div align="center">

**⚔️ Ready to Battle!**

Start the server, open two browsers, and compete!

*Built with ❤️ by the MathBot Arena Team*

</div>
