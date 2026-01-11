# 🌐 MathBot Arena Server

WebSocket server for real-time PvP battles using Socket.io.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
cd server
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables as needed:
```env
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Build for production
npm run build

# Production mode
npm run start
```

The server will start on `http://localhost:3001` (or your configured PORT).

## 📡 WebSocket API

### Client → Server Messages

#### Find Match
```typescript
{
  type: 'FIND_MATCH',
  payload: {
    userId: string,
    heroData: BattleHero,
    rank: number,
    ageCategory: 'child' | 'teen' | 'adult'
  }
}
```

#### Cancel Queue
```typescript
{
  type: 'CANCEL_QUEUE',
  payload: { userId: string }
}
```

#### Ready
```typescript
{
  type: 'READY',
  payload: { battleId: string }
}
```

#### Submit Answer
```typescript
{
  type: 'SUBMIT_ANSWER',
  payload: {
    battleId: string,
    answer: number,
    timeTaken: number
  }
}
```

#### Use Ultimate
```typescript
{
  type: 'USE_ULTIMATE',
  payload: { battleId: string }
}
```

#### Surrender
```typescript
{
  type: 'SURRENDER',
  payload: { battleId: string }
}
```

### Server → Client Messages

#### Queue Joined
```typescript
{
  type: 'QUEUE_JOINED',
  payload: {
    position: number,
    estimatedWait: number
  }
}
```

#### Match Found
```typescript
{
  type: 'MATCH_FOUND',
  payload: {
    battleId: string,
    opponent: {
      name: string,
      level: number,
      archetype: string,
      rank: number
    }
  }
}
```

#### Battle Start
```typescript
{
  type: 'BATTLE_START',
  payload: {
    battleId: string,
    round: number,
    question: Task,
    timeLimit: number
  }
}
```

#### Round Result
```typescript
{
  type: 'ROUND_RESULT',
  payload: {
    battleId: string,
    round: number,
    result: RoundResultData,
    player1HP: number,
    player2HP: number,
    animation: AnimationData
  }
}
```

#### Battle End
```typescript
{
  type: 'BATTLE_END',
  payload: {
    battleId: string,
    winner: { userId: string, name: string },
    rewards: BattleRewards,
    stats: BattleStats
  }
}
```

## 🎯 Architecture

### BattleManager

Core class that orchestrates all battle logic:

- **Matchmaking**: Runs every 2 seconds, matches players based on rank, level, and age category
- **Battle Flow**: Manages round-by-round progression
- **Damage Calculation**: Uses battle mechanics from `src/battle/battleMechanics.ts`
- **Disconnect Handling**: 30-second timeout before auto-win

### Matchmaking Algorithm

```typescript
function calculateMatchScore(p1: Player, p2: Player): number {
  const rankDiff = Math.abs(p1.rank - p2.rank);
  const levelDiff = Math.abs(p1.hero.level - p2.hero.level);
  const waitTime = Math.max(Date.now() - p1.queuedAt, Date.now() - p2.queuedAt);

  let score = rankDiff * 2 + levelDiff * 5;

  // After 30s, increase match probability
  if (waitTime > 30000) score *= 0.7;

  // After 60s, increase even more
  if (waitTime > 60000) score *= 0.5;

  return score;
}
```

**Criteria**:
- Rank difference < 100
- Level difference < 5
- Same age category (child, teen, adult)
- Lower score = better match

### ELO Rating System

```typescript
function calculateEloChange(winnerRank: number, loserRank: number, kFactor = 32) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRank - winnerRank) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRank - loserRank) / 400));

  return {
    winnerChange: Math.round(kFactor * (1 - expectedWinner)),
    loserChange: Math.round(kFactor * (0 - expectedLoser))
  };
}
```

## 📊 Battle Flow

1. **Queue Phase**
   - Players join matchmaking queue
   - Matchmaking runs every 2 seconds
   - Best matches are paired based on criteria

2. **Loading Phase** (3 seconds)
   - Both players receive `MATCH_FOUND`
   - Players send `READY` message
   - Loading screen displayed

3. **Round Phase** (45 seconds per question)
   - Server sends question to both players
   - Players submit answers
   - Round resolves when both answer or timeout

4. **Resolution Phase** (2 seconds)
   - Damage calculated using battle mechanics
   - HP updated
   - Buffs/debuffs processed
   - Ultimate charge updated

5. **Battle End**
   - Battle ends when HP <= 0 or max rounds reached
   - ELO ratings updated
   - Rewards calculated
   - Stats compiled

## 🔧 Configuration

### Battle Settings

| Setting | Default | Description |
|---------|---------|-------------|
| QUESTION_TIME_LIMIT | 45s | Time per question |
| MAX_ROUNDS | 10 | Maximum rounds per battle |
| DISCONNECT_TIMEOUT | 30s | Time before auto-win |
| MATCHMAKING_INTERVAL | 2s | Matchmaking frequency |

### ELO Settings

| Setting | Default | Description |
|---------|---------|-------------|
| ELO_K_FACTOR | 32 | Rating adjustment speed |

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "uptime": 1234.56,
  "queue": {
    "child": 5,
    "teen": 3,
    "adult": 2
  },
  "activeBattles": 7
}
```

### Stats

```bash
curl http://localhost:3001/stats
```

Response:
```json
{
  "queue": {
    "child": 5,
    "teen": 3,
    "adult": 2
  },
  "activeBattles": 7,
  "connectedPlayers": 20
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create mathbot-arena-server

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://mathbot-arena.vercel.app

# Deploy
git push heroku main
```

### AWS / Azure / GCP

See deployment guides in the main README.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### WebSocket Connection Failed

Check CORS configuration in `server/index.ts`:
```typescript
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### Matchmaking Not Working

- Check that `MATCHMAKING_INTERVAL` is set (default: 2000ms)
- Verify at least 2 players are in the same age category
- Check rank/level differences are within thresholds

## 📝 Logging

Logs are output to console with prefixes:

- `⚔️` Battle events
- `🎯` Matchmaking events
- `🔌` Connection events
- `❌` Errors
- `⚠️` Warnings

Example:
```
⚔️ BattleManager initialized
🎯 Player user123 joined child queue (5 total)
🔌 Client connected: abc123xyz
⚔️ Battle created: battle_1234567890_xyz
💥 Round 1 resolved: ATTACK
🏆 Battle battle_1234567890_xyz ended: Player1 wins!
```

## 🔐 Security

### Future Enhancements

- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Input validation
- [ ] Anti-cheat measures
- [ ] DDoS protection
- [ ] Encrypted connections (WSS)

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Battle Mechanics Documentation](../src/battle/battleMechanics.ts)
- [PvP Arena Design](../PVP_ARENA_DESIGN.md)
- [Main README](../README.md)

## 📧 Support

For issues or questions:
- Email: info@y7agency.com
- Telegram: [@sergiivoo](https://t.me/sergiivoo)
- GitHub Issues: [Report Bug](https://github.com/yourusername/mathbot-arena/issues)

---

<div align="center">

**⚔️ MathBot Arena Server v1.0**

Built with ❤️ by the MathBot Arena Team

</div>
