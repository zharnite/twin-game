import Scene from "../../../Wolfie2D/Scene/Scene";
import SceneManager from "../../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../../Wolfie2D/SceneGraph/Viewport";
import { ScreenTexts } from "../Enums/ScreenTextEnums";
import MainMenu from "../Screens/MainMenu";
import SceneItemCreator from "./SceneItemCreator";

export default class InfoScreenCreator {
  private scene: Scene;
  private viewport: Viewport;
  private layer: string;
  private sceneManager: SceneManager;

  /**
   * This class helps constructs an information screen (Controls.ts, Credits.ts, Help.ts)
   * @param scene
   * @param viewport
   * @param layer
   * @param sceneManager
   */
  constructor(
    scene: Scene,
    viewport: Viewport,
    layer: string,
    sceneManager: SceneManager
  ) {
    this.scene = scene;
    this.viewport = viewport;
    this.layer = layer;
    this.sceneManager = sceneManager;
  }

  /**
   * Creates the heading text for an information screen
   * @param heading Name of the information screen
   */
  public createHeading(heading: string): void {
    SceneItemCreator.createHeadingLabel(
      this.scene,
      this.viewport,
      this.layer,
      heading
    );
  }

  /**
   * Creates the body text for an information screen
   */
  public createBody() {
    SceneItemCreator.createTextBody(this.scene, this.viewport, this.layer, 600);
  }

  /**
   * Creates the return button for an information screen
   */
  public createReturnButton() {
    SceneItemCreator.createButton(
      this.scene,
      this.layer,
      1000,
      730,
      ScreenTexts.RETURN
    ).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  public createContinueButton() {
    SceneItemCreator.createButton(
      this.scene,
      this.layer,
      1005,
      765,
      ScreenTexts.CONTINUE
    ).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };
  }

  /**
   * Creates the full information screen with the heading, text body, and return button
   * @param heading Name of the screen
   */
  public createScreen(heading: string) {
    this.createHeading(heading);
    this.createBody();
    this.createReturnButton();
  }
}
