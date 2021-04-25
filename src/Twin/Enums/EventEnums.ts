export enum Events {
  PLAYER_MOVE = "PlayerMove",
  PLAYER_JUMP = "PlayerJump",
  PLAYER_HIT_COIN = "PlayerHitCoin",
  PLAYER_HIT_COIN_BLOCK = "PlayerHitCoinBlock",
  PLAYER_HIT_ENEMY = "PlayerHitEnemy",
  ENEMY_DIED = "EnemyDied",
  PLAYER_ENTERED_LEVEL_END = "PlayerEnteredLevelEnd",
  LEVEL_START = "LevelStart",
  LEVEL_END = "LevelEnd",
  // New events
  PLAYER_FLIPPED_LEVER_ON = "PlayerFlippedLeverOn",
  PLAYER_FLIPPED_LEVER_OFF = "PlayerFlippedLeverOff",
  PLAYER_HIT_SPIKE = "PlayerHitSpike",
}
