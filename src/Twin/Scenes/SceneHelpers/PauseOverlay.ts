import CanvasNode from "../../../Wolfie2D/Nodes/CanvasNode";
import Scene from "../../../Wolfie2D/Scene/Scene";
import SceneManager from "../../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../../Wolfie2D/SceneGraph/Viewport";
import MainMenu from "../MainMenu";
import PauseTracker from "./PauseTracker";
import SceneItemCreator from "./SceneItemCreator";

export default class PauseOverlay {
  private scene: Scene;
  private viewport: Viewport;
  private layer: string;
  private loadedObjects: CanvasNode[];
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
    this.createScreenButtons();
  }

  removePauseOverlay(): void {
    console.log(this.layer);
    this.loadedObjects.forEach((obj) => {
      let node = this.scene.getSceneGraph().getNode(obj.id);
      this.scene.getSceneGraph().removeNode(node);
      this.scene.getLayer(this.layer).removeNode(node);
    });
    this.loadedObjects = [];
  }

  createScreenButtons(): void {
    // resume button
    let half = this.viewport.getHalfSize();
    let resumeButton = SceneItemCreator.createButton(
      this.scene,
      this.layer,
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
      this.layer,
      1000,
      550,
      "MAIN MENU"
    );
    this.loadedObjects.push(menuButton);
    menuButton.onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };

    // Controls button
    this.createScreenButton("Controls", 1000, 610);

    // Help button
    this.createScreenButton("Help", 1000, 670);

    // Credits button
    this.createScreenButton("Controls", 1000, 730);
  }

  createScreenButton(name: string, x: number, y: number): void {
    let half = this.viewport.getHalfSize();
    let controlsButton = SceneItemCreator.createButton(
      this.scene,
      this.layer,
      x,
      y,
      name.toUpperCase()
    );
    this.loadedObjects.push(controlsButton);
    controlsButton.onClick = () => {
      let labels = SceneItemCreator.createPauseScreenButton(
        this.scene,
        this.layer,
        half,
        name
      );
      this.loadedObjects = this.loadedObjects.concat(labels);
    };
  }
}
