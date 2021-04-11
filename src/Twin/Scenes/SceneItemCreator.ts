import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Color from "../../Wolfie2D/Utils/Color";

/**
 * Creates scene items
 */
export default class SceneItemCreator {
  static createHeadingLabel(
    scene: Scene,
    viewport: Viewport,
    layer: string,
    heading: string
  ): void {
    let halfSize = viewport.getHalfSize();
    let label = <Label>scene.add.uiElement(UIElementType.LABEL, layer, {
      position: new Vec2(halfSize.x, 100),
      text: heading,
    });
    label.fontSize = 50;
    label.textColor = Color.WHITE;
    label.font = "Monospace";
  }

  static createTextBody(
    scene: Scene,
    viewport: Viewport,
    layer: string,
    x: number
  ): void {
    let obj = scene.load.getObject(layer);
    let body = obj[layer];

    let halfSize = viewport.getHalfSize();
    let vertex = new Vec2(x, 200);
    let space = 50;
    let i = 1;
    body.forEach((str: string) => {
      let label = <Label>scene.add.uiElement(UIElementType.LABEL, layer, {
        position: new Vec2(vertex.x, vertex.y + space * i),
        text: str,
      });
      label.setHAlign("left");
      label.textColor = Color.WHITE;
      label.font = "Monospace";
      i++;
    });
  }

  static createText(
    scene: Scene,
    viewport: Viewport,
    layer: string,
    x: number,
    y: number,
    str: string
  ) {
    let label = <Label>scene.add.uiElement(UIElementType.LABEL, layer, {
      position: new Vec2(x, y),
      text: str,
    });
    label.textColor = Color.WHITE;
    label.backgroundColor = Color.BLACK;
    label.font = "Monospace";
    label.padding = new Vec2(20, 10);
  }

  static createButton(
    scene: Scene,
    layer: string,
    x: number,
    y: number,
    str: string
  ): Button {
    // Create button
    let button = <Button>scene.add.uiElement(UIElementType.BUTTON, layer, {
      position: new Vec2(x, y),
      text: str,
    });

    // Apply button styles
    button.applyButtonStyle(
      Color.WHITE,
      Color.BLACK,
      new Vec2(250, 50),
      "NoPixel"
    );

    return button;
  }

  static createLevelButton(
    scene: Scene,
    layer: string,
    x: number,
    y: number,
    str: string,
    unlocked: boolean
  ) {
    // Create button
    let button = <Button>scene.add.uiElement(UIElementType.BUTTON, layer, {
      position: new Vec2(x, y),
      text: str,
    });

    // Apply button styles
    let lockedColor = new Color(51, 51, 51, 1);
    if (!unlocked) {
      button.applyButtonStyle(
        lockedColor,
        Color.BLACK,
        new Vec2(250, 50),
        "NoPixel"
      );
    } else {
      button.applyButtonStyle(
        Color.WHITE,
        Color.BLACK,
        new Vec2(250, 50),
        "NoPixel"
      );
    }

    return button;
  }

  /**
   * Transparent full screen button
   */
  static createScreenButton(scene: Scene, layer: string) {
    // Create button
    let half = scene.getViewport().getHalfSize();
    let button = <Button>scene.add.uiElement(UIElementType.BUTTON, layer, {
      position: new Vec2(half.x, half.y),
      text: "",
    });

    // Apply button styles
    button.applyButtonStyle(
      Color.TRANSPARENT,
      Color.TRANSPARENT,
      new Vec2(half.x * 2, half.y * 2),
      "NoPixel"
    );

    return button;
  }
}
