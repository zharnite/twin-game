import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Controls from "./Controls";
import Credits from "./Credits";
import Help from "./Help";
import Level1 from "./Level1";
import SceneItemCreator from "./SceneItemCreator";

export default class MainMenu extends Scene {
  animatedSprite: AnimatedSprite;

  loadScene(): void {}

  startScene(): void {
    let layer = "Main";
    this.addUILayer(layer);

    let size = this.viewport.getHalfSize();
    this.viewport.setFocus(size);

    // Play button
    let playBtn = (
      SceneItemCreator.createButton(this, layer, 1000, 550, "Play Game")
    );

    // Controls button
    let controlsBtn = (
      SceneItemCreator.createButton(this, layer, 1000, 610, "Controls")
    );

    // Help button
    let helpBtn = (
      SceneItemCreator.createButton(this, layer, 1000, 670, "Help")
    );

    // Credits button
    let creditsBtn = (
      SceneItemCreator.createButton(this, layer, 1000, 730, "Credits")
    );

    // When the play button is clicked, go to the first level
    // Twin TODO [Benchmark 2] (Code) - Make this connect to a Level Select Screen (Connect when making LevelSelect.ts)
    playBtn.onClick = () => {
      /*
                Init the next scene with physics collisions:

                        ground  player  enemy   coin
                ground    No      --      --     --
                player   Yes      No      --     --
                enemy    Yes      No      No     --
                coin      No     Yes      No     No

                Each layer becomes a number. In this case, 4 bits matter for each

                ground: self - 0001, collisions - 0110
                player: self - 0010, collisions - 1001
                enemy:  self - 0100, collisions - 0001
                coin:   self - 1000, collisions - 0010
            */

      let sceneOptions = {
        physics: {
          groupNames: ["ground", "player", "enemy", "coin"],
          collisions: [
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [1, 0, 0, 0],
            [0, 1, 0, 0],
          ],
        },
      };
      this.sceneManager.changeToScene(Level1, {}, sceneOptions);
    };

    // Jump to Controls screen
    controlsBtn.onClick = () => {
      this.sceneManager.changeToScene(Controls, {});
    };
    // Jump to Help screen
    helpBtn.onClick = () => {
      this.sceneManager.changeToScene(Help, {});
    };
    // Jump to Credits screen
    creditsBtn.onClick = () => {
      this.sceneManager.changeToScene(Credits, {});
    };
  }

  updateScene(): void {}
}
