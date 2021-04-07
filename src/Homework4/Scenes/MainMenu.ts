import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Level1 from "./Level1";

export default class MainMenu extends Scene {

    animatedSprite: AnimatedSprite;

    // Apply user-defined styles to a basic button.
    applyButtonStyle (button: Button, backgroundColor: Color, textColor: Color, size: Vec2, fontStr: string): void {
        button.setBackgroundColor(backgroundColor);
        button.setTextColor(textColor);
        button.size.x = size.x;
        button.size.y = size.y;
        button.font = fontStr;
    }

    loadScene(): void {}

    startScene(): void {
        this.addUILayer("Main");

        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        // Play Button
        let playBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "Main", {position: new Vec2(1000, 550), text: "Play Game"});
        this.applyButtonStyle(playBtn, Color.WHITE, Color.BLACK, new Vec2(250, 50), "NoPixel");
        // Controls button
        let controlsBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "Main", {position: new Vec2(1000, 610), text: "Controls"});
        this.applyButtonStyle(controlsBtn, Color.WHITE, Color.BLACK, new Vec2(250, 50), "NoPixel");
        // Help Button
        let helpBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "Main", {position: new Vec2(1000, 670), text: "Help"});
        this.applyButtonStyle(helpBtn, Color.WHITE, Color.BLACK, new Vec2(250, 50), "NoPixel");
        // Credits Button
        let creditsButton = <Button>this.add.uiElement(UIElementType.BUTTON, "Main", {position: new Vec2(1000, 730), text: "Credits"});
        this.applyButtonStyle(creditsButton, Color.WHITE, Color.BLACK, new Vec2(250, 50), "NoPixel");


        // When the play button is clicked, go to the next scene
        playBtn.onClick = () => {
            /*
                Init the next scene with physics collisions:

                        ground  player  enemy   coin
                ground    No      --      --     --
                player   Yes      No      --     --
                enemy    Yes      No      No     --
                coin      No     Yes      No     No

                Each layer becomes a number. In this case, 4 bits matter for each

                ground: self - 0001, collisions - 0110
                player: self - 0010, collisions - 1001
                enemy:  self - 0100, collisions - 0001
                coin:   self - 1000, collisions - 0010
            */

            let sceneOptions = {
                physics: {
                    groupNames: ["ground", "player", "enemy", "coin"],
                    collisions:
                    [
                        [0, 1, 1, 0],
                        [1, 0, 0, 1],
                        [1, 0, 0, 0],
                        [0, 1, 0, 0]
                    ]
                }
            }
            this.sceneManager.changeToScene(Level1, {}, sceneOptions);
        }
    }

    updateScene(): void {}
    
}

