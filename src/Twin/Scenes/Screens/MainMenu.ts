import Scene from "../../../Wolfie2D/Scene/Scene";
import Controls from "./InfoScreens/Controls";
import Credits from "./InfoScreens/Credits";
import Help from "./InfoScreens/Help";
import LevelSelect from "./LevelSelect";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import LevelTracker from "../SceneHelpers/LevelTracker";

export default class MainMenu extends Scene {
  loadScene(): void {
    // Load click sfx
    this.load.audio("menuButton", "assets/sounds/sfx/menuButton.mp3");

    if (LevelTracker.isGameComplete()) {
      // Load after game complete bg
      this.load.image("menuScreen", "assets/images/menuBGComplete.png");
    } else {
      // Load before game complete bg
      this.load.image("menuScreen", "assets/images/menuBGIncomplete.png");
    }
  }

  startScene(): void {
    let layer = "Main";
    this.addUILayer(layer);

    // Create menu buttons
    this.createMenuButtons(layer);

    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
      key: "menuButton",
      loop: false,
    });

    // Add background image
    this.createBackground();
  }

  public createBackground(): void {
    // Create background layer and attach background image to center
    let hs = this.viewport.getHalfSize();
    this.addLayer("background");
    let background = this.add.sprite("menuScreen", "background");
    background.position.set(hs.x, hs.y);
  }

  /**
   * Creates the 4 menu buttons: play game (leads to level select), controls, help, and credits
   * @param layer Name of the layer
   */
  createMenuButtons(layer: string): void {
    // Play button
    SceneItemCreator.createButton(this, layer, 1000, 550, "PLAY GAME").onClick =
      () => {
        this.sceneManager.changeToScene(LevelSelect, {});
      };

    // Controls button
    SceneItemCreator.createButton(this, layer, 1000, 610, "CONTROLS").onClick =
      () => {
        this.sceneManager.changeToScene(Controls, {});
      };

    // Help button
    SceneItemCreator.createButton(this, layer, 1000, 670, "HELP").onClick =
      () => {
        this.sceneManager.changeToScene(Help, {});
      };

    // Credits button
    SceneItemCreator.createButton(this, layer, 1000, 730, "CREDITS").onClick =
      () => {
        this.sceneManager.changeToScene(Credits, {});
      };
  }

  updateScene(): void {}
}
