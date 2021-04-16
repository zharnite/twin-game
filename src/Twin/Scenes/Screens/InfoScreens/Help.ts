import Scene from "../../../../Wolfie2D/Scene/Scene";
import MainMenu from "../MainMenu";
import SceneItemCreator from "../../SceneHelpers/SceneItemCreator";
import { Screens } from "../../Enums/ScreenEnums";
import InfoScreenCreator from "../../SceneHelpers/InfoScreenCreator";
import { ScreenTexts } from "../../Enums/ScreenTextEnums";

export default class Help extends Scene {
  private layer: string;

  loadScene(): void {
    this.load.object("Help", "assets/texts/help.json");
  }

  startScene(): void {
    // Create Help layer
    this.layer = Screens.HELP;
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
    isc.createScreen(ScreenTexts.HELP);
  }

  updateScene(): void {}
}
