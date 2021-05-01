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
  PLAYER_OVERLAPS_LEVER = "PlayerOverlapsLever",
  PLAYER_HIT_SPIKE = "PlayerHitSpike",
  PLAYER_ON_GROUND = "PlayerOnGround",
  PLAYER_HIT_CEILING = "PlayerHitCeiling",
}
