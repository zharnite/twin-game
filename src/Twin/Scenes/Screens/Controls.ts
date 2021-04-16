import Scene from "../../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";
import { Screens } from "../Enums/ScreenEnums";

export default class Controls extends Scene {
  private layer: string;

  loadScene(): void {
    this.load.object("Controls", "assets/texts/controls.json");
  }

  startScene(): void {
    // Create Controls layer
    this.layer = Screens.CONTROLS;
    this.addUILayer(this.layer);

    // Create screen objects
    this.createScreen();
  }

  /**
   * Creates the screen with the heading label, text body, and return button.
   */
  private createScreen(): void {
    // Create heading
    SceneItemCreator.createHeadingLabel(
      this,
      this.viewport,
      this.layer,
      "CONTROLS"
    );

    // Create text body
    SceneItemCreator.createTextBody(this, this.viewport, this.layer, 600);

    // Create return button
    SceneItemCreator.createButton(
      this,
      this.layer,
      1000,
      730,
      "RETURN"
    ).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  updateScene(): void {}
}
