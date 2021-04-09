import Scene from "../../Wolfie2D/Scene/Scene";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Color from "../../Wolfie2D/Utils/Color";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import MainMenu from "./MainMenu";
import SceneItemCreator from "./SceneItemCreator";

export default class Credits extends Scene {
  loadScene(): void {
    this.load.object("Credits", "assets/texts/credits.json");
  }

  startScene(): void {
    // Twin TODO - Edit credits.json with more information

    let layer = "Credits";
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
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  updateScene(): void {}
}
