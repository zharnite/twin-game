// Twin TODO (optional) - optimize this along with Level2

import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { Levels } from "../../Enums/LevelEnums";
import { PlayerTypes } from "../../Enums/PlayerEnums";
import { EnemyTypes } from "../../Enums/EnemyEnums";
import GameLevel from "./GameLevel";
import Level2 from "./Level2";
import TerrainManager from "./LevelHelpers/TerrainManager";

export default class Level1 extends GameLevel {
  private level: string;

  loadScene(): void {
    this.level = Levels.LEVEL_1;

    this.load.image("background", "assets/sprites/Twin-Background.png");
    this.load.image("coin", "assets/sprites/coin.png");
    this.load.spritesheet(
      PlayerTypes.PLAYER,
      "assets/spritesheets/platformPlayer.json"
    );
    this.load.spritesheet(
      PlayerTypes.GHOST_PLAYER,
      "assets/spritesheets/platformGhostPlayer.json"
    );
    // Testing assets
    this.load.tilemap(this.level, "assets/tilemaps/untitled.json");
    this.load.spritesheet(EnemyTypes.BOAR, "assets/spritesheets/boar.json");

    // load things from parent
    super.loadScene();
  }

  startScene(): void {
    // Set up the initial scene
    this.setUpScene();

    // Do generic setup for a GameLevel
    super.startScene();

    // Initialize level specific variables
    this.initLevelVariables();

    // Initialize all enemies in the level
    this.setUpEnemies();

    // Set up TerrainManager to parse tiles
    this.terrainManager = new TerrainManager(this, this.level);
    this.terrainManager.parseTilemap();
  }

  private setUpScene(): void {
    // Add a background layer and set the background image on it
    this.addParallaxLayer("bg", new Vec2(0.25, 0), -100);
    let bg = this.add.sprite("background", "bg");
    bg.scale.set(2, 2);
    bg.position.set(bg.boundary.halfSize.x, 76);

    // Add the level 1 tilemap
    this.add.tilemap(this.level, new Vec2(2, 2));
    let tilemap = this.load.getTilemap(this.level);
    this.viewport.setBounds(0, 0, tilemap.width * 32, tilemap.height * 32);
  }

  private initLevelVariables(): void {
    // Set up current and next level
    this.currentLevel = Level1;
    this.nextLevel = Level2;
  }

  private setUpEnemies(): void {
    // All enemies in the level go here.
    this.addEnemy(EnemyTypes.BOAR, new Vec2(11, 8), {});
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);
  }
}
