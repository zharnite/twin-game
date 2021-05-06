import Scene from "../../../Wolfie2D/Scene/Scene";
import MainMenu from "./MainMenu";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { Screens } from "../Enums/ScreenEnums";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import Starting from "./Starting";

export default class Splash extends Scene {
  private layer: string;

  loadScene(): void {
    this.load.image("splashScreen", "assets/images/TwinSplashScreen.png");
    this.load.image(
      "splashScreenText",
      "assets/images/ClickAnywhereToContinue.png"
    );
    this.load.image(
      "movingBackground",
      "assets/images/TwinMovingBackground.png"
    );
    // Load click sfx
    this.load.audio("menuButton", "assets/sounds/sfx/menuButton.mp3");
    // Load startup jingle
    this.load.audio("startup", "assets/sounds/sfx/gameStartup.mp3");
  }

  startScene(): void {
    // Create Splash layer
    this.layer = Screens.SPLASH;
    this.addUILayer(this.layer);

    // Add background image
    this.createBackground();

    // Play startup sfx
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
      key: "startup",
      loop: false,
      holdReference: true,
    });

    // Transparent full screen button to get to Starting comic
    SceneItemCreator.createScreenButton(this, this.layer).onClick = () => {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
        key: "menuButton",
        loop: false,
      });
      this.sceneManager.changeToScene(Starting, {});
    };
  }

  /**
   * Creates and adds the background image in the Splash screen.
   */
  public createBackground(): void {
    // Create background layer and attach background image to center
    this.addLayer("background");
    let background = this.add.sprite("movingBackground", "background");
    background.position.set(
      background.boundary.halfSize.x,
      background.boundary.halfSize.y
    );

    this.addLayer("splash");
    let splash = this.add.sprite("splashScreen", "splash");
    splash.position.set(splash.boundary.halfSize.x, splash.boundary.halfSize.y);

    this.addLayer("splashText");
    let splashText = this.add.sprite("splashScreenText", "splashText");
    splashText.position.set(
      splashText.boundary.halfSize.x,
      splashText.boundary.halfSize.y
    );

    // Add fade in animations for all images
    background.tweens.add("moveLeft", {
      startDelay: 0,
      reverseOnComplete: true,
      loop: true,
      duration: 80000,
      effects: [
        {
          property: TweenableProperties.posX,
          start: 0,
          end: background.boundary.x,
          ease: EaseFunctionType.LINEAR,
        },
      ],
    });
    splash.tweens.add("fadeIn", {
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
    });

    splashText.tweens.add("fadeInText", {
      startDelay: 0,
      duration: 4000,
      effects: [
        {
          property: TweenableProperties.alpha,
          start: 0,
          end: 1,
          ease: EaseFunctionType.EASE_IN_WITH_DELAY,
        },
      ],
    });

    // Play fadeIn animation
    background.tweens.play("moveLeft");
    splash.tweens.play("fadeIn");
    splashText.tweens.play("fadeInText");
  }

  updateScene(): void {}
}
