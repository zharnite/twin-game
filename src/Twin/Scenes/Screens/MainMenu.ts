import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Controls from "./InfoScreens/Controls";
import Credits from "./InfoScreens/Credits";
import Help from "./InfoScreens/Help";
import LevelSelect from "./LevelSelect";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";

export default class MainMenu extends Scene {
  animatedSprite: AnimatedSprite;

  loadScene(): void {
    // Load click sfx
    this.load.audio("menuButton", "assets/sounds/sfx/menuButton.mp3");
  }

  startScene(): void {
    let layer = "Main";
    this.addUILayer(layer);

    let size = this.viewport.getHalfSize();
    this.viewport.setFocus(size);

    // Create menu buttons
    this.createMenuButtons(layer);
  }

  /**
   * Creates the 4 menu buttons: play game (leads to level select), controls, help, and credits
   * @param layer Name of the layer
   */
  createMenuButtons(layer: string): void {
    // Play button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      550,
      "PLAY GAME"
    ).onClick = () => {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menuButton"});
      this.sceneManager.changeToScene(LevelSelect, {});
    };

    // Controls button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      610,
      "CONTROLS"
    ).onClick = () => {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menuButton"});
      this.sceneManager.changeToScene(Controls, {});
    };

    // Help button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      670,
      "HELP"
    ).onClick = () => {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menuButton"});
      this.sceneManager.changeToScene(Help, {});
    };

    // Credits button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      730,
      "CREDITS"
    ).onClick = () => {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menuButton"});
      this.sceneManager.changeToScene(Credits, {});
    };
  }

  updateScene(): void {}
}
