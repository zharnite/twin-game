// Twin TODO (optional) - optimize this along with Level2

import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { Levels } from "../../Enums/LevelEnums";
import { PlayerTypes } from "../../Enums/PlayerEnums";
import { EnemyTypes } from "../../Enums/EnemyEnums";
import GameLevel from "./GameLevel";
import Level2 from "./Level2";
import TerrainManager from "./LevelHelpers/TerrainManager";
import { InteractableTypes } from "../../Enums/InteractableEnums";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Satan from "../../../Interactables/Satan";
// import Satan from "../../../Interactables/Satan";
// import { InteractableTypes } from "../../Enums/InteractableEnums";

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
    this.load.spritesheet(EnemyTypes.BOAR, "assets/spritesheets/boar.json");
    this.load.spritesheet(
      EnemyTypes.HELLHAWK,
      "assets/spritesheets/hellhawk.json"
    );
    this.load.spritesheet(
      InteractableTypes.LEVEL_END_PORTAL,
      "assets/spritesheets/portal.json"
    );

    // Load satan's spritesheet
    this.load.spritesheet(
      InteractableTypes.MR_SATAN,
      "assets/spritesheets/businessdevil.json"
    );

    // Testing assets
    this.load.tilemap(this.level, "assets/tilemaps/untitled.json");
    this.load.spritesheet(
      InteractableTypes.MR_SATAN,
      "assets/spritesheets/businessdevil.json"
    );

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

    // Initialize interactables with their level-dependent properties.
    this.setUpInteractables();
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
    // this.addEnemy(EnemyTypes.BOAR, new Vec2(11, 8), {});
    // this.addEnemy(EnemyTypes.HELLHAWK, new Vec2(12, 8), {});
  }

  private setUpInteractables(): void {
    // Set Mr. Satan's required coin value and position for this level.
    this.satan.setRequiredCoinValue(1);
    this.satan.setTilePosition(new Vec2(19, 5));
    this.satan.sprite.animation.play("RUBHANDS", true);
    // Place the level end portal in the world over the body and soul exit tile locations.
    let bodyPortalSprite = this.setUpPortalSprite("body");
    let soulPortalSprite = this.setUpPortalSprite("soul");
    bodyPortalSprite.animation.play("OPEN", true);
    soulPortalSprite.animation.play("OPEN", true);
  }

  // Build an animated portal sprite.
  private setUpPortalSprite(type: string): AnimatedSprite {
    let portalSprite = this.add.animatedSprite(
      InteractableTypes.LEVEL_END_PORTAL,
      "primary"
    );
    portalSprite.scale.set(2, 2);
    portalSprite.addPhysics();
    portalSprite.disablePhysics();
    portalSprite.position.set(
      this.terrainManager.getExitLocation(type).x,
      this.terrainManager.getExitLocation(type).y - 8
    );
    return portalSprite;
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);
  }
}
