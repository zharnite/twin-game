import Scene from "../../../../Wolfie2D/Scene/Scene";
import MainMenu from "../MainMenu";
import SceneItemCreator from "../../SceneHelpers/SceneItemCreator";

export default class Credits extends Scene {
  private init: Record<string, any>;

  loadScene(): void {
    this.load.object("Credits", "assets/texts/credits.json");
  }

  initScene(init: Record<string, any>): void {
    this.init = init;
  }

  startScene(): void {
    let layer = "Credits";
    this.addUILayer(layer);

    SceneItemCreator.createHeadingLabel(this, this.viewport, layer, "CREDITS");
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
