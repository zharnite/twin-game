import Scene from "../../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";

export default class Controls extends Scene {

  loadScene(): void {
    this.load.object("Controls", "assets/texts/controls.json");
  }

  startScene(): void {
    let layer = "Controls";
    this.addUILayer(layer);

    SceneItemCreator.createHeadingLabel(this, this.viewport, layer, "CONTROLS");
    SceneItemCreator.createTextBody(this, this.viewport, layer, 600);
    // return button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      730,
      "RETURN"
    ).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  updateScene(): void {}
}
