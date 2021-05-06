import Scene from "../../../Wolfie2D/Scene/Scene";
import { Screens } from "../Enums/ScreenEnums";
import InfoScreenCreator from "../SceneHelpers/InfoScreenCreator";

export default class Ending extends Scene {
  private layer: string;

  loadScene(): void {
    // TODO: ending comic.
    this.load.image("endingScreen", "assets/images/EndingScreen.png");
  }

  startScene(): void {
    // Create ending layer
    this.layer = Screens.ENDING;
    this.addUILayer(this.layer);

    // Add background image
    this.createBackground();

    // Create return button
    this.createReturn();
  }

  public createBackground(): void {
    // Create background layer and attach background image to center
    let hs = this.viewport.getHalfSize();
    this.addLayer("background");
    let background = this.add.sprite("endingScreen", "background");
    background.position.set(hs.x, hs.y);
  }

  private createReturn(): void {
    let isc = new InfoScreenCreator(
      this,
      this.viewport,
      this.layer,
      this.sceneManager
    );
    isc.createReturnButton();
  }
}
