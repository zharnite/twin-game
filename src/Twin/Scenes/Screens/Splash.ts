import Scene from "../../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { Events } from "../../enums";
import { Screens } from "../Enums/ScreenEnums";

export default class Splash extends Scene {
  private layer: string;

  loadScene(): void {
    // Twin TODO (optional) - update splash screen image here
    this.load.image("background", "assets/images/TwinSplashScreen.png");
  }

  startScene(): void {
    // Create Splash layer
    this.layer = Screens.SPLASH;
    this.addUILayer(this.layer);

    // Add background image
    this.createBackground();

    // Transparent full screen button to get to MainMenu
    SceneItemCreator.createScreenButton(this, this.layer).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  /**
   * Creates and adds the background image in the Splash screen.
   */
  private createBackground(): void {
    // Create background layer and attach background image to center
    this.addLayer("bg");
    let bg = this.add.sprite("background", "bg");
    bg.position.set(bg.boundary.halfSize.x, bg.boundary.halfSize.y);

    // Add fadeIn animation
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

    // Play fadeIn animation
    bg.tweens.play("fadeIn");
  }

  updateScene(): void {}
}
