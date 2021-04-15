import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import CanvasNode from "../../Wolfie2D/Nodes/CanvasNode";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";
import PauseTracker from "./PauseTracker";
import SceneItemCreator from "./SceneHelpers/SceneItemCreator";

export default class PauseOverlay {
  private scene: Scene;
  private viewport: Viewport;
  private layer: string;
  private loadedObjects: CanvasNode[];
  private loadedTextObjects: CanvasNode[];
  private pauseTracker: PauseTracker;
  private sceneManager: SceneManager;

  constructor(
    scene: Scene,
    viewport: Viewport,
    layer: string,
    pauseTracker: PauseTracker,
    sceneManager: SceneManager
  ) {
    this.scene = scene;
    this.viewport = viewport;
    this.layer = layer;
    this.pauseTracker = pauseTracker;
    this.sceneManager = sceneManager;
    this.loadedObjects = [];
    this.loadedTextObjects = [];
  }

  createPauseOverlay(): void {
    this.loadedObjects.push(
      SceneItemCreator.createScreenButtonShaded(this.scene, this.layer)
    );
    this.loadedObjects.push(
      SceneItemCreator.createHeadingLabel(
        this.scene,
        this.viewport,
        this.layer,
        "PAUSE"
      )
    );
    this.createScreenButtons(this.layer);
  }

  removePauseOverlay(): void {
    this.loadedObjects.forEach((obj) => {
      let node = this.scene.getSceneGraph().getNode(obj.id);
      this.scene.getSceneGraph().removeNode(node);
      this.scene.getLayer(this.layer).removeNode(node);
    });
    this.loadedObjects = [];
  }

  createScreenButtons(layer: string): void {
    // resume button
    let half = this.viewport.getHalfSize();
    let resumeButton = SceneItemCreator.createButton(
      this.scene,
      layer,
      half.x,
      half.y,
      "RESUME"
    );
    this.loadedObjects.push(resumeButton);
    resumeButton.onClick = () => {
      this.pauseTracker.toggle();
    };

    // Menu button
    let menuButton = SceneItemCreator.createButton(
      this.scene,
      layer,
      1000,
      550,
      "MAIN MENU"
    );
    this.loadedObjects.push(menuButton);
    menuButton.onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };

    // Controls button
    let controlsButton = SceneItemCreator.createButton(
      this.scene,
      layer,
      1000,
      610,
      "CONTROLS"
    );
    this.loadedObjects.push(controlsButton);
    controlsButton.onClick = () => {
      let obj = this.scene.load.getObject("Controls");
      let body = obj["Controls"];
      let i = 1;
      body.forEach((str: string) => {
        let label = <Label>this.scene.add.uiElement(
          UIElementType.LABEL,
          layer,
          {
            position: new Vec2(300, half.y + 50 + 30 * i),
            text: str,
          }
        );
        label.fontSize = 14;
        label.textColor = Color.WHITE;
        label.backgroundColor = Color.BLACK;
        label.font = "Monospace";
        label.padding = new Vec2(20, 10);
        this.loadedObjects.push(label);
        i++;
      });
    };

    // Help button
    let helpButton = SceneItemCreator.createButton(
      this.scene,
      layer,
      1000,
      670,
      "HELP"
    );
    this.loadedObjects.push(helpButton);
    helpButton.onClick = () => {
      let obj = this.scene.load.getObject("Help");
      let body = obj["Help"];
      let i = 1;
      body.forEach((str: string) => {
        let label = <Label>this.scene.add.uiElement(
          UIElementType.LABEL,
          layer,
          {
            position: new Vec2(300, half.y + 50 + 30 * i),
            text: str,
          }
        );
        label.fontSize = 14;
        label.textColor = Color.WHITE;
        label.backgroundColor = Color.BLACK;
        label.font = "Monospace";
        label.padding = new Vec2(20, 10);
        this.loadedObjects.push(label);
        i++;
      });
    };

    // Credits button
    let creditsButton = SceneItemCreator.createButton(
      this.scene,
      layer,
      1000,
      730,
      "CREDITS"
    );
    this.loadedObjects.push(creditsButton);
    creditsButton.onClick = () => {
      let obj = this.scene.load.getObject("Credits");
      let body = obj["Credits"];
      let i = 1;
      body.forEach((str: string) => {
        let label = <Label>this.scene.add.uiElement(
          UIElementType.LABEL,
          layer,
          {
            position: new Vec2(300, half.y + 50 + 30 * i),
            text: str,
          }
        );
        label.fontSize = 14;
        label.textColor = Color.WHITE;
        label.backgroundColor = Color.BLACK;
        label.font = "Monospace";
        label.padding = new Vec2(20, 10);
        this.loadedObjects.push(label);
        i++;
      });
    };
  }
}
