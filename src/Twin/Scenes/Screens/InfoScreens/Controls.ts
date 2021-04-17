import Scene from "../../../../Wolfie2D/Scene/Scene";
import { Screens } from "../../Enums/ScreenEnums";
import { ScreenTexts } from "../../Enums/ScreenTextEnums";
import InfoScreenCreator from "../../SceneHelpers/InfoScreenCreator";

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

  private createScreen(): void {
    let isc = new InfoScreenCreator(
      this,
      this.viewport,
      this.layer,
      this.sceneManager
    );
    isc.createScreen(ScreenTexts.CONTROLS);
  }

  updateScene(): void {}
}
