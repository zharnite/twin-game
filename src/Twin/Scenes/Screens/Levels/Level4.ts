import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { EnemyTypes } from "../../Enums/EnemyEnums";
import { InteractableTypes } from "../../Enums/InteractableEnums";
import { Levels } from "../../Enums/LevelEnums";
import { PlayerTypes } from "../../Enums/PlayerEnums";
import LevelTracker from "../../SceneHelpers/LevelTracker";
import GameLevel from "./GameLevel";
import Level5 from "./Level5";
import TerrainManager from "./LevelHelpers/TerrainManager";

export default class Level4 extends GameLevel {
  private level: string;

  loadScene(): void {
    this.level = Levels.LEVEL_4;

    // TWIN TODO: remove things we don't need to load
    // Images
    this.load.image("background", "assets/sprites/Twin-Background.png");
    this.load.image("coin", "assets/sprites/coin.png");

    // Spritesheets
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
      InteractableTypes.LEVEL_END_DOOR,
      "assets/spritesheets/door.json"
    );
    this.load.spritesheet(
      InteractableTypes.LEVEL_END_PORTAL,
      "assets/spritesheets/portal.json"
    );
    this.load.spritesheet(
      InteractableTypes.MR_SATAN,
      "assets/spritesheets/businessdevil.json"
    );

    // TWIN TODO: Change to actual tilemap
    this.load.tilemap(this.level, "assets/tilemaps/level4.json");

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
    this.terrainManager = new TerrainManager(this, this.level);
    this.terrainManager.parseTilemap();

    // Initialize interactables with their level-dependent properties.
    this.setUpInteractables();

    // Set exit locations for levels without Satan
    this.setExits();
  }

  private setUpScene(): void {
    // Add a background layer and set the background image on it
    this.addParallaxLayer("bg", new Vec2(0.25, 0), -100);
    let bg = this.add.sprite("background", "bg");
    bg.scale.set(2, 2);
    bg.position.set(bg.boundary.halfSize.x, 76);

    // Add the level tilemap
    this.add.tilemap(this.level, new Vec2(2, 2));
    let tilemap = this.load.getTilemap(this.level);
    this.viewport.setBounds(0, 0, tilemap.width * 32, tilemap.height * 32);
  }

  private initLevelVariables(): void {
    // Set up current and next level
    this.currentLevel = Level4;
    this.nextLevel = Level5;

    // Unlock this level when entered
    LevelTracker.unlockLevel(Levels.LEVEL_4);
  }

  private setExits(): void {
    // Set up exits if there are no satans
    if (!this.satan) {
      this.terrainManager.setExitLocations(
        this.terrainManager.bodyExitLocation,
        this.terrainManager.soulExitLocation
      );
    }
  }

  private setUpInteractables(): void {
    this.setUpSatan();
  }

  protected setUpSatan(): void {
    // Initialize Satan
    this.initSatan();

    // Set Mr. Satan's required coin value
    this.satan.setRequiredCoinValue(8);

    // Set up from parent class
    super.setUpSatan();
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);
  }
}
