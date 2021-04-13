import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Controls from "./Controls";
import Credits from "./Credits";
import Help from "./Help";
import Level1 from "./Levels/Level1";
import LevelSelect from "./LevelSelect";
import SceneItemCreator from "./SceneHelpers/SceneItemCreator";

export default class MainMenu extends Scene {
  animatedSprite: AnimatedSprite;

  loadScene(): void {}

  startScene(): void {
    let layer = "Main";
    this.addUILayer(layer);

    let size = this.viewport.getHalfSize();
    this.viewport.setFocus(size);

    // Create menu buttons
    this.createMenuButtons(layer);
  }

  /**
   * Creates the 4 menu buttons: play, controls, help, and credits
   * @param layer Name of the layer
   */
  createMenuButtons(layer: string): void {
    // Play button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      550,
      "Play Game"
    ).onClick = () => {
      this.sceneManager.changeToScene(LevelSelect, {});
    };

    // Controls button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      610,
      "Controls"
    ).onClick = () => {
      this.sceneManager.changeToScene(Controls, {});
    };

    // Help button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      670,
      "Help"
    ).onClick = () => {
      this.sceneManager.changeToScene(Help, {});
    };

    // Credits button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      730,
      "Credits"
    ).onClick = () => {
      this.sceneManager.changeToScene(Credits, {});
    };
  }

  updateScene(): void {}
}
