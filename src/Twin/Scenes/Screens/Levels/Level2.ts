import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../../../Wolfie2D/Debug/Debug";
import GameLevel from "./GameLevel";
import LevelTracker from "../../SceneHelpers/LevelTracker";
import { Levels } from "../../Enums/LevelEnums";
import Level3 from "./Level3";

export default class Level2 extends GameLevel {
  loadScene(): void {
    this.load.image("background", "assets/sprites/2bitbackground.png");
    this.load.image("coin", "assets/sprites/coin.png");
    this.load.tilemap("level2", "assets/tilemaps/level2.json");
    this.load.spritesheet("player", "assets/spritesheets/platformPlayer.json");
    this.load.spritesheet(
      "ghostPlayer",
      "assets/spritesheets/platformGhostPlayer.json"
    );
    this.load.spritesheet("hopper", "assets/spritesheets/hopper.json");
    this.load.spritesheet("bunny", "assets/spritesheets/ghostBunny.json");
  }

  startScene(): void {
    // Set up level variables
    this.initLevelVariables();

    // Add a background layer and set the background image on it
    this.addParallaxLayer("bg", new Vec2(0.25, 0), -100);
    let bg = this.add.sprite("background", "bg");
    bg.scale.set(2, 2);
    bg.position.set(bg.boundary.halfSize.x, 96);

    // Add the level 2 tilemap
    this.add.tilemap("level2", new Vec2(2, 2));
    this.viewport.setBounds(0, 0, 64 * 32, 20 * 32);

    // Do generic setup for a GameLevel
    super.startScene();

    // Set up exit locations
    this.playerExitLocation = new Vec2(58, 17);
    this.ghostPlayerExitLocation = new Vec2(58, 23);
    this.exitSize = new Vec2(1, 1);

    // Set up exits for player and ghostPlayer
    this.addLevelEnd(new Vec2(58, 17), new Vec2(1, 1), "player");
    this.addLevelEnd(new Vec2(58, 23), new Vec2(1, 1), "ghostPlayer");

    // // Add enemies of various types
    // for (let pos of [new Vec2(24, 18)]) {
    //   this.addEnemy("bunny", pos, {});
    // }

    // for (let pos of [new Vec2(51, 17)]) {
    //   this.addEnemy("hopper", pos, { jumpy: true });
    // }
  }

  private initLevelVariables(): void {
    // Initialize variables
    this.playerSpawn = new Vec2(5 * 32, 18 * 32);
    this.ghostPlayerSpawn = new Vec2(5 * 32, 18 * 32);

    // Set up current and next level
    this.currentLevel = Level2;
    this.nextLevel = Level3;

    // Unlock this level when entered
    LevelTracker.unlockLevel(Levels.LEVEL_2);
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);

    Debug.log("playerpos", this.player.position.toString());
  }
}
