import Scene from "../../../Wolfie2D/Scene/Scene";
import { Screens } from "../Enums/ScreenEnums";
import InfoScreenCreator from "../SceneHelpers/InfoScreenCreator";

export default class Starting extends Scene {
  private layer: string;

  loadScene(): void {
    // TODO: starting comic.
    this.load.image("startingScreen", "assets/images/StartingScreen.png");
  }

  startScene(): void {
    // Create starting layer
    this.layer = Screens.STARTING;
    this.addUILayer(this.layer);

    let size = this.viewport.getHalfSize();
    this.viewport.setFocus(size);

    // Add background image
    this.createBackground();

    // Create continue button
    this.createContinue();
  }

  public createBackground(): void {
    // Create background layer and attach background image to center
    let hs = this.viewport.getHalfSize();
    this.addLayer("background");
    let background = this.add.sprite("startingScreen", "background");
    background.position.set(hs.x, hs.y);
  }

  private createContinue(): void {
    let isc = new InfoScreenCreator(
      this,
      this.viewport,
      this.layer,
      this.sceneManager
    );
    isc.createContinueButton();
  }
}
