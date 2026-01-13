-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "masteryScore" REAL NOT NULL DEFAULT 0.0,
    "rollingAccuracy" REAL NOT NULL DEFAULT 0.0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" DATETIME,
    "dueAt" DATETIME,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "currentDifficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mastery_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mastery" ("correctAttempts", "createdAt", "currentDifficulty", "dueAt", "id", "lastSeenAt", "masteryScore", "rollingAccuracy", "skillId", "streak", "totalAttempts", "updatedAt", "userId") SELECT "correctAttempts", "createdAt", "currentDifficulty", "dueAt", "id", "lastSeenAt", "masteryScore", "rollingAccuracy", "skillId", "streak", "totalAttempts", "updatedAt", "userId" FROM "Mastery";
DROP TABLE "Mastery";
ALTER TABLE "new_Mastery" RENAME TO "Mastery";
CREATE INDEX "Mastery_userId_idx" ON "Mastery"("userId");
CREATE INDEX "Mastery_skillId_idx" ON "Mastery"("skillId");
CREATE INDEX "Mastery_dueAt_idx" ON "Mastery"("dueAt");
CREATE INDEX "Mastery_masteryScore_idx" ON "Mastery"("masteryScore");
CREATE UNIQUE INDEX "Mastery_userId_skillId_key" ON "Mastery"("userId", "skillId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
