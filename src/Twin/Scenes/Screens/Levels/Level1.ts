// Twin TODO [Benchmark 2] (Code & Art) - Make levels; read "World Rendering" part of  Benchmark 2
// Twin TODO [Benchmark 2] (Code) - Figure out file format for levels

import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../../../Wolfie2D/Debug/Debug";
import GameLevel from "./GameLevel";
import Level2 from "./Level2";

export default class Level1 extends GameLevel {
  loadScene(): void {
    this.load.image("background", "assets/sprites/2bitbackground.png");
    this.load.image("coin", "assets/sprites/coin.png");
    this.load.tilemap("test_level", "assets/tilemaps/testing_level.json");
    this.load.spritesheet("player", "assets/spritesheets/platformPlayer.json");
    this.load.spritesheet(
      "ghostPlayer",
      "assets/spritesheets/platformGhostPlayer.json"
    );

    // load pause items
    this.load.object("Controls", "assets/texts/controls.json");
    this.load.object("Help", "assets/texts/help.json");
    this.load.object("Credits", "assets/texts/credits.json");
  }

  startScene(): void {
    // Set up level variables
    this.initLevelVariables();

    // Add a background layer and set the background image on it
    this.addParallaxLayer("bg", new Vec2(0.25, 0), -100);
    let bg = this.add.sprite("background", "bg");
    bg.scale.set(2, 2);
    bg.position.set(bg.boundary.halfSize.x, 76);

    // Add the level 1 tilemap
    this.add.tilemap("test_level", new Vec2(2, 2));
    this.viewport.setBounds(0, 0, 32 * 32, 16 * 32);

    // Do generic setup for a GameLevel
    super.startScene();

    // Set up exit locations
    this.playerExitLocation = new Vec2(30, 14);
    this.ghostPlayerExitLocation = new Vec2(30, 11);
    this.exitSize = new Vec2(1, 1);

    // Set up exits for player and ghostPlayer
    this.addLevelEnd(new Vec2(30, 14), new Vec2(1, 1), "player");
    this.addLevelEnd(new Vec2(30, 11), new Vec2(1, 1), "ghostPlayer");
  }

  private initLevelVariables(): void {
    // Initialize variables
    this.playerSpawn = new Vec2(2 * 32, 14 * 32);
    this.ghostPlayerSpawn = new Vec2(4 * 32, 14 * 32);

    // Set up current and next level
    this.currentLevel = Level1;
    this.nextLevel = Level2;
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);
    Debug.log("playerpos", this.player.position.toString());
  }
}
