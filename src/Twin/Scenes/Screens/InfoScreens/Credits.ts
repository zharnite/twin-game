import Scene from "../../../../Wolfie2D/Scene/Scene";
import { Screens } from "../../Enums/ScreenEnums";
import { ScreenTexts } from "../../Enums/ScreenTextEnums";
import InfoScreenCreator from "../../SceneHelpers/InfoScreenCreator";

export default class Credits extends Scene {
  private layer: string;

  loadScene(): void {
    this.load.object("Credits", "assets/texts/credits.json");
  }

  startScene(): void {
    // Create Credits layer
    this.layer = Screens.CREDITS;
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
    isc.createScreen(ScreenTexts.CREDITS);
  }

  updateScene(): void {}
}
