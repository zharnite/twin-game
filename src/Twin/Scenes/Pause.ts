import Scene from "../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "./SceneHelpers/SceneItemCreator";

export default class Splash extends Scene {
  loadScene(): void {}

  startScene(): void {
    let layer = "Pause";
    this.addUILayer(layer);
  }

  updateScene(): void {}
}
