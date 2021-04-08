import Scene from "../../Wolfie2D/Scene/Scene";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Color from "../../Wolfie2D/Utils/Color";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import MainMenu from "./MainMenu";

export default class Help extends Scene {

  loadScene(): void {}

  startScene(): void {
    // TODO - Add real text to display help/info

    // Testing stuff
    this.addUILayer("Help");
    let helpLabel = <Label>this.add.uiElement(
      UIElementType.LABEL,
      "Help",
      {
        position: new Vec2(600, 100),
        text: "There is no help coming for you. You are alone in this world",
      }
    );
    helpLabel.textColor = Color.RED;

    // Return to Main Menu button
    let returnButton = <Button>(
      this.add.uiElement(UIElementType.BUTTON, "Help", {
        position: new Vec2(1000, 730),
        text: "Return",
      })
    );
    returnButton.applyButtonStyle(
      Color.WHITE,
      Color.BLACK,
      new Vec2(250, 50),
      "NoPixel"
    );

    // When the control button is clicked, go to the controls screen
    returnButton.onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  updateScene(): void {}
}
