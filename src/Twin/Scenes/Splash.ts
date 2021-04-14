import Scene from "../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "./SceneItemCreator";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { Events } from "../enums";

export default class Splash extends Scene {
  loadScene(): void {
    this.load.image("background", "assets/images/TwinSplashScreen.png");
  }

  startScene(): void {
    let layer = "Splash";
    this.addUILayer(layer);

    // Add background layer
    this.addLayer("bg");
    let bg = this.add.sprite("background", "bg");
    bg.position.set(bg.boundary.halfSize.x, bg.boundary.halfSize.y);
    bg.tweens.add("fadeIn", {
      startDelay: 0,
      duration: 2000,
      effects: [
        {
          property: TweenableProperties.alpha,
          start: 0,
          end: 1,
          ease: EaseFunctionType.IN_OUT_QUAD,
        },
      ],
      onEnd: Events.LEVEL_END,
    });

    bg.tweens.play("fadeIn");

    // Click splash screen to get to MainMenu
    SceneItemCreator.createScreenButton(this, layer).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  updateScene(): void {}
}
