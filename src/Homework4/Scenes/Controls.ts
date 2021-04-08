import Scene from "../../Wolfie2D/Scene/Scene";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Color from "../../Wolfie2D/Utils/Color";

export default class Controls extends Scene {
  loadScene(): void {}
  startScene(): void {
    // TODO - Nav bar to return to main menu
    // TODO - Add real text
    // Testing stuff
    this.addUILayer("Controls");
    let controlsLabel = <Label>this.add.uiElement(
      UIElementType.LABEL,
      "Controls",
      {
        position: new Vec2(100, 100),
        text: "Controls",
      }
    );
    controlsLabel.textColor = Color.WHITE;
  }
  updateScene(): void {}
}
