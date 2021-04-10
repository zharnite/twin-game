import Scene from "../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "./SceneItemCreator";

export default class Splash extends Scene {
  loadScene(): void {
    // Twin TODO - make a real Splash screen
    this.load.image("background", "assets/sprites/TwinPlaceholderSplash.png");
  }

  startScene(): void {
    let layer = "Splash";
    this.addUILayer(layer);

    // Add background layer
    this.addLayer("bg");
    let bg = this.add.sprite("background", "bg");
    bg.position.set(bg.boundary.halfSize.x, bg.boundary.halfSize.y);

    // Click splash screen to get to MainMenu
    SceneItemCreator.createScreenButton(this, layer).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  updateScene(): void {}
}
