// Twin TODO [Benchmark 2] (Code & Art) - Make levels; read "World Rendering" part of  Benchmark 2
// Twin TODO [Benchmark 2] (Code) - Figure out file format for levels
// Twin TODO (optional) - optimize this along with Level2

import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../../../Wolfie2D/Debug/Debug";
import { PlayerTypes } from "../../Enums/PlayerEnums";
import GameLevel from "./GameLevel";
import Level2 from "./Level2";
import TerrainManager from "./LevelHelpers/TerrainManager";

export default class Level1 extends GameLevel {
  private tilemap: string = "Level1";
  public terrainManager: TerrainManager;

  loadScene(): void {
    this.load.image("background", "assets/sprites/Twin-Background.png");
    this.load.image("coin", "assets/sprites/coin.png");
    this.load.tilemap(this.tilemap, "assets/tilemaps/untitled.json");
    this.load.spritesheet(
      PlayerTypes.PLAYER,
      "assets/spritesheets/platformPlayer.json"
    );
    this.load.spritesheet(
      PlayerTypes.GHOST_PLAYER,
      "assets/spritesheets/platformGhostPlayer.json"
    );
    this.load.spritesheet("BodyLever", "assets/spritesheets/BodyLever.json");
    this.load.spritesheet("SoulLever", "assets/spritesheets/SoulLever.json");

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

    // Set up TerrainManager to parse tiles
    this.terrainManager = new TerrainManager(this, this.tilemap);
    this.terrainManager.parseTilemap();

    // Add interactables
    this.setUpInteractables();
  }

  private setUpScene(): void {
    // Add a background layer and set the background image on it
    this.addParallaxLayer("bg", new Vec2(0.25, 0), -100);
    let bg = this.add.sprite("background", "bg");
    bg.scale.set(2, 2);
    bg.position.set(bg.boundary.halfSize.x, 76);

    // Add the level 1 tilemap
    this.add.tilemap(this.tilemap, new Vec2(2, 2));
    this.viewport.setBounds(0, 0, 32 * 32, 16 * 32);
  }

  private initLevelVariables(): void {
    // Set up current and next level
    this.currentLevel = Level1;
    this.nextLevel = Level2;
  }

  private setUpInteractables(): void {
    // for a lever: State - Sprite Key - Position - List of Associated Blocks
    this.addLever("off", "BodyLever", new Vec2(19, 14), [
      new Vec2(20, 11),
      new Vec2(20, 12),
      new Vec2(20, 13),
      new Vec2(20, 14),
    ]);
    this.addLever("off", "SoulLever", new Vec2(22, 14), [
      new Vec2(23, 11),
      new Vec2(23, 12),
      new Vec2(23, 13),
      new Vec2(23, 14),
    ]);
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);
  }
}
