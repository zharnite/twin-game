// Twin TODO [Benchmark 2] (Code) - Core game mechanics in this level
// Twin TODO [Benchmark 2] (Art) - Create an animated character (spritesheet for player)
// Twin TODO [Benchmark 2] (Code & Art) - Make levels; read "World Rendering" part of  Benchmark 2
// Twin TODO [Benchmark 2] (Code) - Figure out file format for levels
// Twin TODO (Code & Art) - Update to the correct player and ghost sprites for all levels

import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../../Wolfie2D/Debug/Debug";
import Input from "../../../Wolfie2D/Input/Input";
import GameLevel from "../GameLevel";
import Level2 from "./Level2";

export default class Level1 extends GameLevel {
  private followNodeIndex = 0;

  loadScene(): void {
    this.load.image("background", "assets/sprites/2bitbackground.png");
    this.load.image("coin", "assets/sprites/coin.png");
    this.load.tilemap("test_level", "assets/tilemaps/testing_level.json");
    this.load.spritesheet("player", "assets/spritesheets/platformPlayer.json");
    this.load.spritesheet(
      "ghostPlayer",
      "assets/spritesheets/platformGhostPlayer.json"
    );
  }

  startScene(): void {
    // Add a background layer and set the background image on it
    this.addParallaxLayer("bg", new Vec2(0.25, 0), -100);
    let bg = this.add.sprite("background", "bg");
    bg.scale.set(2, 2);
    bg.position.set(bg.boundary.halfSize.x, 76);

    // Add the level 1 tilemap
    this.add.tilemap("test_level", new Vec2(2, 2));
    this.viewport.setBounds(0, 0, 32 * 32, 16 * 32);

    this.playerSpawn = new Vec2(2 * 32, 14 * 32);

    // Do generic setup for a GameLevel
    super.startScene();

    // this.addLevelEnd(new Vec2(58, 17), new Vec2(2, 2));

    this.nextLevel = Level2;
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);

    Debug.log("playerpos", this.player.position.toString());

    // swap view key input
    if (Input.isJustPressed("swap view")) {
      this.followNodeIndex++;
      this.followNodeIndex = this.followNodeIndex % this.followNodes.length;
      this.viewport.follow(this.followNodes[this.followNodeIndex]);
    }
  }
}
