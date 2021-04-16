import Scene from "../../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";

export default class Help extends Scene {
  loadScene(): void {
    this.load.object("Help", "assets/texts/help.json");
  }

  startScene(): void {
    let layer = "Help";
    this.addUILayer(layer);

    SceneItemCreator.createHeadingLabel(this, this.viewport, layer, "HELP");
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
