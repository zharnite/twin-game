import Scene from "../../Wolfie2D/Scene/Scene";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Color from "../../Wolfie2D/Utils/Color";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import MainMenu from "./MainMenu";

export default class Controls extends Scene {
  loadScene(): void {
    this.load.object("Controls", "assets/texts/controls.json");
  }

  startScene(): void {
    // TODO - Add real text to display controls

    // Testing stuff
    let layer = "Controls";
    this.addUILayer(layer);

    // Zhen TODO - these functions can probably be put in a component and reused across the other Scenes
    this.createHeadingLabel(layer, layer);
    this.createTextBody(layer);
    this.createReturnButton(1000, 730);
  }

  createHeadingLabel(layer: string, heading: string): void {
    let halfSize = this.viewport.getHalfSize();
    let label = <Label>this.add.uiElement(UIElementType.LABEL, layer, {
      position: new Vec2(halfSize.x, 100),
      text: heading,
    });
    label.fontSize = 50;
    label.textColor = Color.WHITE;
    label.font = "Monospace";
  }

  createTextBody(layer: string): void {
    let obj = this.load.getObject(layer);
    let body = obj[layer];

    let halfSize = this.viewport.getHalfSize();
    let vertex = new Vec2(300, 200);
    let space = 50;
    let i = 1;
    body.forEach((str: string) => {
      let label = <Label>this.add.uiElement(UIElementType.LABEL, layer, {
        position: new Vec2(vertex.x, vertex.y + space * i),
        text: "- " + str,
      });
      label.setHAlign("left");
      label.textColor = Color.WHITE;
      label.font = "Monospace";
      i++;
    });
  }

  createReturnButton(x: number, y: number): void {
    // Create return button
    let returnButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "Controls",
      {
        position: new Vec2(x, y),
        text: "Return",
      }
    );

    // Apply button styles
    returnButton.applyButtonStyle(
      Color.WHITE,
      Color.BLACK,
      new Vec2(250, 50),
      "NoPixel"
    );

    // Add onClick back to MainMenu
    returnButton.onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  updateScene(): void {}
}
