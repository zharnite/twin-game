import Scene from "../../Wolfie2D/Scene/Scene";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Color from "../../Wolfie2D/Utils/Color";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import MainMenu from "./MainMenu";
import SceneItemCreator from "./SceneHelpers/SceneItemCreator";
import GameLevel from "./GameLevel";
import Pause from "./Pause";

export default class Help extends Scene {
  private init: Record<string, any>;

  loadScene(): void {
    this.load.object("Help", "assets/texts/help.json");
  }

  initScene(init: Record<string, any>): void {
    this.init = init;
  }

  startScene(): void {
    // Twin TODO (Text) - Edit help.json with real help/info

    let layer = "Help";
    this.addUILayer(layer);

    SceneItemCreator.createHeadingLabel(this, this.viewport, layer, layer);
    SceneItemCreator.createTextBody(this, this.viewport, layer, 600);
    // return button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      730,
      "Return"
    ).onClick = () => {
      if (this.init.level) {
        this.sceneManager.changeToScene(Pause, this.init);
      } else {
        this.sceneManager.changeToScene(MainMenu, {});
      }
    };
  }

  updateScene(): void {}
}
