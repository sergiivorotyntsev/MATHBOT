# ⚔️ MathBot Arena - PvP Battle System Design

## 🎯 Концепция

**MathBot Arena** - это математический поединок в реальном времени, где игроки сражаются, решая задачи. Скорость и точность определяют урон, а навыки героя влияют на бой через мультипликаторы и специальные эффекты.

**Визуальный стиль**: Аниме (вдохновение - Genshin Impact, Honkai Star Rail, Demon Slayer)

---

## 🎮 Battle Mechanics

### Основной игровой цикл

```
1. Matchmaking → Find opponent
2. Battle Start → Choose avatar positions
3. Round Begin → Both players get same question
4. Racing → First correct answer wins round
5. Damage Calculation → Apply damage with modifiers
6. Visual Animation → Show attack/defense
7. Next Round → Repeat until someone's HP = 0
8. Victory Screen → Show rewards
```

### Параметры Героя в Бою

```typescript
interface BattleHero {
  // Base Stats
  maxHP: number;           // 100 + (level × 10)
  currentHP: number;
  attack: number;          // 10 + (arithmeticLevel × 2)
  defense: number;         // 10 + (geometryLevel × 2)
  speed: number;           // 10 + (logicLevel × 2)
  critRate: number;        // 5% + (combo × 1%)
  critDamage: number;      // 150% base

  // Skill Multipliers
  primarySkillBonus: number;    // From arithmetic/geometry/logic levels
  secondarySkillBonus: number;  // From speed/concentration/adaptability
  ultimateSkillCharge: number;  // 0-100, charges during battle

  // Active Buffs/Debuffs
  activeBuffs: Buff[];
  activeDebuffs: Debuff[];

  // Battle Stats
  comboStreak: number;     // Consecutive correct answers
  dodgeChance: number;     // Based on speed stat
  blockChance: number;     // Based on defense stat
}
```

---

## 💥 Damage Formula

### Base Damage Calculation

```typescript
function calculateDamage(
  attacker: BattleHero,
  defender: BattleHero,
  question: Task,
  timeTaken: number,
  timeLimit: number
): DamageResult {
  // 1. BASE DAMAGE (from question difficulty)
  const baseDamage = question.d * 10; // Difficulty 1-6 → 10-60 damage

  // 2. ATTACK MULTIPLIER
  const attackMultiplier = 1 + (attacker.attack / 100);

  // 3. SPEED BONUS (faster = more damage)
  const speedRatio = timeTaken / timeLimit;
  let speedBonus = 1.0;

  if (speedRatio <= 0.25) speedBonus = 1.5;      // Ultra fast: +50%
  else if (speedRatio <= 0.5) speedBonus = 1.3;  // Fast: +30%
  else if (speedRatio <= 0.75) speedBonus = 1.1; // Normal: +10%
  else speedBonus = 0.9;                         // Slow: -10%

  // 4. SKILL TYPE BONUS
  let skillBonus = 1.0;
  if (question.skillType === 'arithmetic' && attacker.primarySkill === 'arithmetic') {
    skillBonus = 1.2; // +20% if matching specialty
  }
  // Same for geometry and logic

  // 5. COMBO MULTIPLIER
  const comboMultiplier = 1 + (attacker.comboStreak * 0.05); // +5% per combo

  // 6. CRITICAL HIT
  const isCritical = Math.random() * 100 < attacker.critRate;
  const critMultiplier = isCritical ? (attacker.critDamage / 100) : 1.0;

  // 7. CALCULATE RAW DAMAGE
  let rawDamage = baseDamage
    * attackMultiplier
    * speedBonus
    * skillBonus
    * comboMultiplier
    * critMultiplier;

  // 8. DEFENSE REDUCTION
  const defenseMultiplier = 1 - (defender.defense / (defender.defense + 100));

  // 9. DODGE CHECK (based on defender's speed)
  const dodgeRoll = Math.random() * 100;
  const isDodged = dodgeRoll < defender.dodgeChance;

  if (isDodged) {
    return {
      damage: 0,
      isCritical: false,
      isDodged: true,
      isBlocked: false,
      displayText: 'DODGE!'
    };
  }

  // 10. BLOCK CHECK (partial damage reduction)
  const blockRoll = Math.random() * 100;
  const isBlocked = blockRoll < defender.blockChance;

  if (isBlocked) {
    rawDamage *= 0.5; // 50% damage reduction on block
  }

  // 11. FINAL DAMAGE
  const finalDamage = Math.floor(rawDamage * defenseMultiplier);

  return {
    damage: finalDamage,
    isCritical,
    isDodged: false,
    isBlocked,
    displayText: isCritical ? 'CRITICAL!' : isBlocked ? 'BLOCKED!' : ''
  };
}
```

### Пример расчёта:

```
Атакующий:
- Level 20
- Attack: 50
- Arithmetic Level: 30
- Combo: 5
- Crit Rate: 10%

Защищающийся:
- Defense: 30
- Dodge Chance: 5%
- Block Chance: 10%

Вопрос:
- Difficulty: 4 (40 base damage)
- Type: Arithmetic
- Time: 5s / 30s limit (ultra fast)

Расчёт:
1. Base: 40
2. Attack: 40 × 1.5 = 60
3. Speed: 60 × 1.5 = 90 (ultra fast)
4. Skill: 90 × 1.2 = 108 (matching type)
5. Combo: 108 × 1.25 = 135 (5-combo)
6. Crit: 135 × 1.5 = 202.5 (rolled crit!)
7. Defense: 202.5 × 0.77 = 156
8. Dodge: Pass (no dodge)
9. Block: Pass (no block)

FINAL DAMAGE: 156 HP
DISPLAY: "CRITICAL HIT! 156"
```

---

## 🎭 Battle Animations

### Animation States

```typescript
type AnimationState =
  | 'idle'           // Breathing, slight movement
  | 'thinking'       // Reading question
  | 'charging'       // Preparing attack
  | 'attacking'      // Execute attack
  | 'defending'      // Block/dodge
  | 'hit'            // Taking damage
  | 'victory'        // Won battle
  | 'defeat'         // Lost battle
  | 'ultimate';      // Special skill activation

interface BattleAnimation {
  state: AnimationState;
  duration: number;      // milliseconds
  effects: ParticleEffect[];
  soundEffect?: string;
  cameraShake?: boolean;
  slowMotion?: boolean;
}
```

### Атака (Attack Animation)

**Warrior (Red):**
```typescript
const warriorAttack: BattleAnimation = {
  state: 'attacking',
  duration: 1200,
  effects: [
    { type: 'dash', from: 'attacker', to: 'defender', speed: 'fast' },
    { type: 'slash', color: '#FF0000', size: 'large', trail: true },
    { type: 'impact', position: 'defender', particles: 'sparks' },
    { type: 'damageNumber', value: damage, color: 'critical' ? 'gold' : 'white' }
  ],
  soundEffect: 'sword_slash.mp3',
  cameraShake: true,
  slowMotion: isCritical
};

// Timeline:
// 0-300ms: Dash towards enemy (motion blur)
// 300-500ms: Slash effect (red arc)
// 500-700ms: Impact + sparks
// 700-900ms: Damage number pops up
// 900-1200ms: Return to position
```

**Scholar (Blue):**
```typescript
const scholarAttack: BattleAnimation = {
  state: 'attacking',
  duration: 1500,
  effects: [
    { type: 'hologram', content: 'mathematical_formula', glow: 'blue' },
    { type: 'projectile', shape: 'energy_sphere', color: '#00D9FF', trail: 'particles' },
    { type: 'explosion', position: 'defender', radius: 'medium', color: 'cyan' },
    { type: 'damageNumber', value: damage, style: 'digital' }
  ],
  soundEffect: 'energy_blast.mp3',
  cameraShake: false,
  slowMotion: false
};

// Timeline:
// 0-500ms: Summon holographic formula
// 500-800ms: Formula transforms into energy sphere
// 800-1100ms: Sphere travels to enemy
// 1100-1300ms: Impact explosion
// 1300-1500ms: Damage display
```

**Artist (Purple):**
```typescript
const artistAttack: BattleAnimation = {
  state: 'attacking',
  duration: 1800,
  effects: [
    { type: 'brush_stroke', color: '#A855F7', path: 'geometric_shape' },
    { type: 'shape_transform', from: '2D', to: '3D', glow: true },
    { type: 'geometric_assault', shapes: ['triangle', 'square', 'circle'] },
    { type: 'shatter', pieces: 12, color: 'rainbow' },
    { type: 'damageNumber', value: damage, style: 'artistic_font' }
  ],
  soundEffect: 'magic_art.mp3',
  cameraShake: true,
  slowMotion: isCritical
};
```

**Engineer (Green):**
```typescript
const engineerAttack: BattleAnimation = {
  state: 'attacking',
  duration: 1400,
  effects: [
    { type: 'deploy_turret', model: 'mechanical', position: 'front' },
    { type: 'laser_charge', color: '#10B981', intensity: 'high' },
    { type: 'laser_beam', width: 'thick', duration: 400 },
    { type: 'circuit_overload', position: 'defender', sparks: true },
    { type: 'damageNumber', value: damage, style: 'tech_font' }
  ],
  soundEffect: 'laser_blast.mp3',
  cameraShake: true,
  slowMotion: false
};
```

### Защита (Defense Animations)

**Dodge (Уклонение):**
```typescript
const dodgeAnimation: BattleAnimation = {
  state: 'defending',
  duration: 800,
  effects: [
    { type: 'blur', intensity: 'high', direction: 'horizontal' },
    { type: 'afterimage', count: 3, opacity: 0.5 },
    { type: 'text_popup', content: 'DODGE!', color: 'cyan', fontSize: 'large' }
  ],
  soundEffect: 'whoosh.mp3',
  cameraShake: false,
  slowMotion: false
};
```

**Block (Блок):**
```typescript
const blockAnimation: BattleAnimation = {
  state: 'defending',
  duration: 600,
  effects: [
    { type: 'shield_appear', shape: 'hexagon', color: 'blue', glow: true },
    { type: 'impact_ripple', rings: 3, color: 'white' },
    { type: 'damage_reduction', percentage: 50, display: '-50%' },
    { type: 'text_popup', content: 'BLOCKED!', color: 'blue' }
  ],
  soundEffect: 'shield_block.mp3',
  cameraShake: true,
  slowMotion: false
};
```

**Hit (Получение урона):**
```typescript
const hitAnimation: BattleAnimation = {
  state: 'hit',
  duration: 400,
  effects: [
    { type: 'knockback', distance: 'small', bounce: true },
    { type: 'flash', color: 'red', opacity: 0.3 },
    { type: 'pain_effect', particles: 'red_cross', count: 5 },
    { type: 'hp_bar_shake', intensity: 'medium' }
  ],
  soundEffect: 'hit_impact.mp3',
  cameraShake: true,
  slowMotion: false
};
```

### Ultimate Skills

**Scholar - "Perfect Calculation":**
```typescript
const perfectCalculation: BattleAnimation = {
  state: 'ultimate',
  duration: 3000,
  effects: [
    { type: 'time_stop', duration: 1000 },
    { type: 'background_change', to: 'matrix_code', fade: 500 },
    { type: 'formula_rain', density: 'high', symbols: 'mathematical' },
    { type: 'avatar_glow', color: 'blue', intensity: 'extreme' },
    { type: 'energy_buildup', particles: 'digital', count: 100 },
    { type: 'mega_explosion', radius: 'screen', color: 'cyan' },
    { type: 'damageNumber', value: damage, scale: 2.0, color: 'rainbow' }
  ],
  soundEffect: 'ultimate_scholar.mp3',
  cameraShake: true,
  slowMotion: true
};
```

**Warrior - "Lightning Strike":**
```typescript
const lightningStrike: BattleAnimation = {
  state: 'ultimate',
  duration: 2500,
  effects: [
    { type: 'dark_clouds', gather: true, lightning: true },
    { type: 'avatar_ascend', height: 'high', glow: 'gold' },
    { type: 'charge_aura', color: 'yellow', electricity: true },
    { type: 'lightning_bolt', from: 'sky', to: 'defender', width: 'massive' },
    { type: 'ground_crack', pattern: 'radial', depth: 'deep' },
    { type: 'damageNumber', value: damage, scale: 2.0, style: 'electric' }
  ],
  soundEffect: 'ultimate_warrior.mp3',
  cameraShake: true,
  slowMotion: true
};
```

---

## 🌐 Multiplayer Architecture

### WebSocket Communication

```typescript
// Client → Server Messages
type ClientMessage =
  | { type: 'FIND_MATCH', payload: { heroId: string, rank: number } }
  | { type: 'READY', payload: { battleId: string } }
  | { type: 'SUBMIT_ANSWER', payload: { battleId: string, answer: number, timeTaken: number } }
  | { type: 'USE_SKILL', payload: { battleId: string, skillId: string } }
  | { type: 'SURRENDER', payload: { battleId: string } }
  | { type: 'CHAT', payload: { battleId: string, message: string } };

// Server → Client Messages
type ServerMessage =
  | { type: 'MATCH_FOUND', payload: { battleId: string, opponent: OpponentInfo } }
  | { type: 'BATTLE_START', payload: { battleId: string, round: 1, question: Task } }
  | { type: 'ANSWER_RESULT', payload: { playerId: string, correct: boolean, damage: number } }
  | { type: 'ROUND_END', payload: { winner: string, animation: BattleAnimation } }
  | { type: 'BATTLE_END', payload: { winner: string, rewards: Rewards } }
  | { type: 'OPPONENT_DISCONNECTED', payload: { reason: string } };
```

### Server Architecture (Node.js + Socket.io)

```typescript
// server/battleManager.ts
class BattleManager {
  private activeBattles: Map<string, Battle>;
  private waitingPlayers: Map<string, PlayerQueue>;

  // Matchmaking
  async findMatch(player: Player): Promise<Battle> {
    const opponent = this.findSuitableOpponent(player);

    if (opponent) {
      return this.createBattle(player, opponent);
    } else {
      this.waitingPlayers.set(player.id, player);
      return null;
    }
  }

  // Matchmaking criteria
  private findSuitableOpponent(player: Player): Player | null {
    for (const [id, opponent] of this.waitingPlayers) {
      const rankDiff = Math.abs(player.rank - opponent.rank);
      const levelDiff = Math.abs(player.level - opponent.level);

      // Match if:
      // - Rank difference < 100
      // - Level difference < 5
      // - Similar age category
      // - Waiting time > 30s (widen criteria)

      if (
        rankDiff < 100 &&
        levelDiff < 5 &&
        player.ageCategory === opponent.ageCategory
      ) {
        this.waitingPlayers.delete(id);
        return opponent;
      }
    }

    return null;
  }

  // Battle creation
  private createBattle(p1: Player, p2: Player): Battle {
    const battleId = generateId();
    const battle = new Battle(battleId, p1, p2);

    this.activeBattles.set(battleId, battle);

    // Notify both players
    this.io.to(p1.socketId).emit('MATCH_FOUND', {
      battleId,
      opponent: p2.getPublicInfo()
    });

    this.io.to(p2.socketId).emit('MATCH_FOUND', {
      battleId,
      opponent: p1.getPublicInfo()
    });

    return battle;
  }

  // Handle answer submission
  async submitAnswer(
    battleId: string,
    playerId: string,
    answer: number,
    timeTaken: number
  ): Promise<void> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) return;

    const result = battle.submitAnswer(playerId, answer, timeTaken);

    if (result.roundComplete) {
      // Both players answered, determine winner
      const roundResult = this.resolveRound(battle);

      // Send animations to both clients
      this.broadcastToB battle(battleId, 'ROUND_END', roundResult);

      // Check if battle is over
      if (battle.isComplete()) {
        const battleResult = this.resolveBattle(battle);
        this.broadcastToBattle(battleId, 'BATTLE_END', battleResult);

        // Cleanup
        this.activeBattles.delete(battleId);
      } else {
        // Start next round
        setTimeout(() => this.startNextRound(battle), 3000);
      }
    }
  }
}
```

### Battle State

```typescript
class Battle {
  id: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  currentRound: number;
  maxRounds: number;
  currentQuestion: Task;
  roundAnswers: Map<string, AnswerSubmission>;
  startTime: number;

  constructor(id: string, p1: Player, p2: Player) {
    this.id = id;
    this.player1 = this.createBattlePlayer(p1);
    this.player2 = this.createBattlePlayer(p2);
    this.currentRound = 0;
    this.maxRounds = 10;
    this.roundAnswers = new Map();
    this.startTime = Date.now();
  }

  startNextRound(): void {
    this.currentRound++;
    this.roundAnswers.clear();

    // Generate question appropriate for both players
    const avgLevel = (this.player1.level + this.player2.level) / 2;
    const difficulty = this.calculateDifficulty(avgLevel);

    this.currentQuestion = this.selectQuestion(difficulty);

    // Broadcast question to both players
    this.broadcast('ROUND_START', {
      round: this.currentRound,
      question: this.currentQuestion,
      timeLimit: this.currentQuestion.time || 45
    });
  }

  submitAnswer(playerId: string, answer: number, timeTaken: number): SubmissionResult {
    const isCorrect = answer === this.currentQuestion.a;

    this.roundAnswers.set(playerId, {
      answer,
      correct: isCorrect,
      timeTaken,
      timestamp: Date.now()
    });

    // Check if both players answered
    const roundComplete = this.roundAnswers.size === 2;

    return {
      correct: isCorrect,
      roundComplete
    };
  }

  resolveRound(): RoundResult {
    const p1Answer = this.roundAnswers.get(this.player1.id);
    const p2Answer = this.roundAnswers.get(this.player2.id);

    // Determine winner
    let attacker: BattlePlayer | null = null;
    let defender: BattlePlayer | null = null;

    if (p1Answer.correct && !p2Answer.correct) {
      attacker = this.player1;
      defender = this.player2;
    } else if (!p1Answer.correct && p2Answer.correct) {
      attacker = this.player2;
      defender = this.player1;
    } else if (p1Answer.correct && p2Answer.correct) {
      // Both correct: faster player attacks
      if (p1Answer.timeTaken < p2Answer.timeTaken) {
        attacker = this.player1;
        defender = this.player2;
      } else {
        attacker = this.player2;
        defender = this.player1;
      }
    } else {
      // Both wrong: no damage
      return {
        type: 'DRAW',
        message: 'Both players answered incorrectly!'
      };
    }

    // Calculate damage
    const damageResult = calculateDamage(
      attacker,
      defender,
      this.currentQuestion,
      attacker === this.player1 ? p1Answer.timeTaken : p2Answer.timeTaken,
      this.currentQuestion.time || 45
    );

    // Apply damage
    defender.currentHP -= damageResult.damage;

    // Update combo
    if (attacker === this.player1 && p1Answer.correct) {
      this.player1.comboStreak++;
      this.player2.comboStreak = 0;
    } else if (attacker === this.player2 && p2Answer.correct) {
      this.player2.comboStreak++;
      this.player1.comboStreak = 0;
    }

    return {
      type: 'ATTACK',
      attacker: attacker.id,
      defender: defender.id,
      damage: damageResult,
      animation: this.getAttackAnimation(attacker.archetype, damageResult)
    };
  }
}
```

---

## 🎨 Frontend Battle UI

### Layout

```
┌─────────────────────────────────────────────┐
│  Player 1 Info     ROUND 3/10   Player 2    │
│  ❤️ 75/100         ⏱️ 00:15     ❤️ 60/100  │
│  🔥 Combo x3                    🔥 Combo x1 │
├─────────────────────────────────────────────┤
│                                              │
│   [Avatar 1]              vs      [Avatar 2]│
│     Idle                            Idle     │
│                                              │
│                                              │
├─────────────────────────────────────────────┤
│            QUESTION DISPLAY                  │
│                                              │
│        What is 7 × 8 + 12 ?                 │
│                                              │
│   [ 68 ]  [ 72 ]  [ 76 ]  [ 80 ]           │
│                                              │
└─────────────────────────────────────────────┘
```

### React Component Structure

```typescript
// components/Battle/BattleArena.tsx
const BattleArena: React.FC = () => {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [animationQueue, setAnimationQueue] = useState<BattleAnimation[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    const ws = io('ws://mathbot-arena.com');

    ws.on('MATCH_FOUND', handleMatchFound);
    ws.on('ROUND_START', handleRoundStart);
    ws.on('ROUND_END', handleRoundEnd);
    ws.on('BATTLE_END', handleBattleEnd);

    setSocket(ws);

    return () => ws.disconnect();
  }, []);

  const handleAnswer = (answer: number) => {
    const timeTaken = Date.now() - battle.roundStartTime;

    socket.emit('SUBMIT_ANSWER', {
      battleId: battle.id,
      answer,
      timeTaken: timeTaken / 1000
    });

    // Lock answers
    setBattle(prev => ({ ...prev, answerLocked: true }));
  };

  return (
    <div className="battle-arena">
      <BattleHeader
        player1={battle.player1}
        player2={battle.player2}
        round={battle.currentRound}
        maxRounds={battle.maxRounds}
      />

      <BattleField
        player1Avatar={battle.player1.avatar}
        player2Avatar={battle.player2.avatar}
        currentAnimation={animationQueue[0]}
      />

      <QuestionPanel
        question={battle.currentQuestion}
        timeLeft={battle.timeLeft}
        onAnswer={handleAnswer}
        locked={battle.answerLocked}
      />

      <BattleLog events={battle.eventLog} />

      {/* Animation Layer */}
      <AnimationCanvas animations={animationQueue} />
    </div>
  );
};
```

---

## 🎬 Advanced Visual Effects

### Particle Systems

```typescript
// Using particles.js or custom WebGL

const attackParticles: ParticleConfig = {
  warrior: {
    count: 50,
    shape: 'triangle',
    colors: ['#FF0000', '#FF6B00', '#FFD700'],
    size: { min: 2, max: 8 },
    velocity: { min: 5, max: 15 },
    lifetime: 0.8,
    gravity: 0.5,
    trail: true
  },
  scholar: {
    count: 100,
    shape: 'circle',
    colors: ['#00D9FF', '#0080FF', '#FFFFFF'],
    size: { min: 1, max: 4 },
    velocity: { min: 3, max: 10 },
    lifetime: 1.2,
    glow: true,
    trail: false
  },
  artist: {
    count: 80,
    shape: 'custom', // geometric shapes
    colors: ['#A855F7', '#EC4899', '#F59E0B'],
    size: { min: 3, max: 12 },
    velocity: { min: 4, max: 12 },
    lifetime: 1.5,
    rotation: true,
    trail: true
  },
  engineer: {
    count: 30,
    shape: 'square',
    colors: ['#10B981', '#00FF00', '#FFFF00'],
    size: { min: 2, max: 6 },
    velocity: { min: 8, max: 20 },
    lifetime: 0.6,
    straight: true, // linear trajectory
    trail: true
  }
};
```

### Camera Effects

```typescript
interface CameraEffect {
  type: 'shake' | 'zoom' | 'pan' | 'rotate';
  intensity: number;
  duration: number;
  easing: string;
}

// Critical hit camera shake
const criticalHitCamera: CameraEffect = {
  type: 'shake',
  intensity: 20, // pixels
  duration: 300,
  easing: 'easeOutQuad'
};

// Ultimate skill dramatic zoom
const ultimateZoom: CameraEffect = {
  type: 'zoom',
  intensity: 1.5, // scale
  duration: 2000,
  easing: 'easeInOutCubic'
};

// Victory pan to winner
const victoryPan: CameraEffect = {
  type: 'pan',
  intensity: 100, // pixels to winner
  duration: 1000,
  easing: 'easeInQuad'
};
```

### Slow Motion

```typescript
const slowMotionEffect = (
  condition: boolean, // e.g., isCritical
  slowFactor: number = 0.3, // 30% speed
  duration: number = 1000
) => {
  if (!condition) return;

  // Reduce animation speed
  document.querySelector('.battle-field').style.animationPlayState = 'paused';

  // Apply time dilation to all animations
  gsap.globalTimeline.timeScale(slowFactor);

  // Audio pitch shift
  audioContext.playbackRate.value = slowFactor;

  // Restore after duration
  setTimeout(() => {
    gsap.globalTimeline.timeScale(1.0);
    audioContext.playbackRate.value = 1.0;
  }, duration);
};
```

---

## 🏆 Rewards & Ranking

### Battle Rewards

```typescript
interface BattleRewards {
  winner: {
    xp: number;           // 100 + (enemyLevel × 10)
    gold: number;         // 50 + (round × 5)
    rankPoints: number;   // +25 for win
    winStreak: number;    // Consecutive wins
    achievements?: Achievement[];
  };
  loser: {
    xp: number;           // 50 (consolation)
    gold: number;         // 20
    rankPoints: number;   // -10 for loss
    winStreak: number;    // Reset to 0
  };

  // Performance bonuses
  bonuses: {
    perfectRound?: number;     // No damage taken
    speedDemon?: number;        // All answers < 10s
    comboMaster?: number;       // 10+ combo
    underdog?: number;          // Win against higher rank
  };
}
```

### Ranking System

```typescript
interface Rank {
  name: string;
  tier: number;
  pointsRequired: number;
  icon: string;
  rewards: {
    titleUnlock?: string;
    cosmeticUnlock?: string;
    privilegeUnlock?: string;
  };
}

const RANKS: Rank[] = [
  { name: 'Bronze', tier: 1, pointsRequired: 0, icon: '🥉' },
  { name: 'Silver', tier: 2, pointsRequired: 100, icon: '🥈' },
  { name: 'Gold', tier: 3, pointsRequired: 300, icon: '🥇' },
  { name: 'Platinum', tier: 4, pointsRequired: 600, icon: '💎' },
  { name: 'Diamond', tier: 5, pointsRequired: 1000, icon: '💠' },
  { name: 'Master', tier: 6, pointsRequired: 1500, icon: '👑' },
  { name: 'Grandmaster', tier: 7, pointsRequired: 2500, icon: '🏆' },
  { name: 'Legend', tier: 8, pointsRequired: 5000, icon: '⭐' },
];
```

---

## 📊 Battle Replay System

```typescript
interface BattleReplay {
  battleId: string;
  timestamp: Date;
  players: [Player, Player];
  rounds: RoundReplay[];
  finalResult: BattleResult;

  // Replay controls
  playbackSpeed: number; // 0.5x, 1x, 2x
  currentRound: number;
  paused: boolean;
}

interface RoundReplay {
  roundNumber: number;
  question: Task;
  player1Answer: AnswerSubmission;
  player2Answer: AnswerSubmission;
  damageDealt: DamageResult;
  animations: BattleAnimation[];
}

// Replay viewer component
const ReplayViewer: React.FC<{ replayId: string }> = ({ replayId }) => {
  const [replay, setReplay] = useState<BattleReplay>();
  const [currentRound, setCurrentRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);

  const playRound = (roundIndex: number) => {
    const round = replay.rounds[roundIndex];

    // Show question
    displayQuestion(round.question);

    // Show both players' answers with timing
    setTimeout(() => {
      showAnswer(round.player1Answer);
    }, round.player1Answer.timeTaken * 1000 / speed);

    setTimeout(() => {
      showAnswer(round.player2Answer);
    }, round.player2Answer.timeTaken * 1000 / speed);

    // Play attack animation
    setTimeout(() => {
      playAnimation(round.animations);
    }, Math.max(
      round.player1Answer.timeTaken,
      round.player2Answer.timeTaken
    ) * 1000 / speed + 1000);
  };

  return (
    <div className="replay-viewer">
      <BattleArena
        battle={replay}
        playbackMode={true}
        onRoundComplete={() => setCurrentRound(prev => prev + 1)}
      />

      <ReplayControls
        playing={playing}
        speed={speed}
        currentRound={currentRound}
        totalRounds={replay.rounds.length}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onSpeedChange={setSpeed}
        onSeek={setCurrentRound}
      />
    </div>
  );
};
```

---

## 🎮 Technical Stack for Battle System

### Frontend
- **React 18** + TypeScript
- **Framer Motion** - Smooth animations
- **GSAP** - Advanced timeline animations
- **Three.js / PixiJS** - 2D/3D graphics (avatars, effects)
- **Socket.io-client** - Real-time communication
- **Howler.js** - Audio management
- **particles.js** - Particle effects

### Backend
- **Node.js** + TypeScript
- **Socket.io** - WebSocket server
- **Redis** - Session storage, matchmaking queue
- **PostgreSQL** - Battle history, replays
- **Bull** - Job queue for matchmaking
- **PM2** - Process management

### Infrastructure
- **AWS EC2 / Railway** - Server hosting
- **Redis Cloud** - Managed Redis
- **Cloudflare** - CDN + DDoS protection
- **Sentry** - Error tracking

---

## 📅 Implementation Timeline

### Week 1: Backend Foundation
- [ ] WebSocket server setup
- [ ] Battle state management
- [ ] Matchmaking algorithm
- [ ] Damage calculation formulas
- [ ] Database schema for battles

### Week 2: Frontend Battle UI
- [ ] Battle arena layout
- [ ] Avatar positioning
- [ ] Question panel
- [ ] HP bars, timers
- [ ] Answer submission

### Week 3: Animations (Basic)
- [ ] Idle animations
- [ ] Attack animations (4 archetypes)
- [ ] Hit/defend animations
- [ ] Damage numbers
- [ ] Victory/defeat poses

### Week 4: Advanced Effects
- [ ] Particle systems
- [ ] Camera shake/zoom
- [ ] Slow motion
- [ ] Critical hit effects
- [ ] Ultimate skill animations

### Week 5: Polish & Testing
- [ ] Sound effects
- [ ] Background music
- [ ] Replay system
- [ ] Ranking system
- [ ] QA testing

---

## 🎯 Success Metrics

### Engagement
- **Battle completion rate**: >80%
- **Rematch rate**: >40%
- **Daily battles per user**: 3-5

### Technical
- **Latency**: <50ms p95
- **Connection stability**: >99%
- **Battle sync issues**: <1%

### Game Balance
- **Win rate distribution**: 45-55% for all archetypes
- **Average battle duration**: 5-8 minutes
- **Rank distribution**: Bell curve

---

**Status**: Design Complete ✅
**Next**: Implementation (Week 1 - Backend) ⏳

---

**Inspiration Sources**:
- **Genshin Impact** - Character models, ultimate animations
- **Honkai Star Rail** - Turn-based battle UI
- **Demon Slayer** - Attack effects, particle systems
- **My Hero Academia** - Speed lines, impact frames
- **One Punch Man** - Critical hit effects
