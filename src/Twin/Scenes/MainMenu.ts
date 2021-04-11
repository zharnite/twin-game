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
import LevelSelect from "./LevelSelect";
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
    let playBtn = SceneItemCreator.createButton(
      this,
      layer,
      1000,
      550,
      "Play Game"
    );

    // Controls button
    let controlsBtn = SceneItemCreator.createButton(
      this,
      layer,
      1000,
      610,
      "Controls"
    );

    // Help button
    let helpBtn = SceneItemCreator.createButton(this, layer, 1000, 670, "Help");

    // Credits button
    let creditsBtn = SceneItemCreator.createButton(
      this,
      layer,
      1000,
      730,
      "Credits"
    );

    // Jump to LevelSelect screen
    playBtn.onClick = () => {
      this.sceneManager.changeToScene(LevelSelect, {});
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
