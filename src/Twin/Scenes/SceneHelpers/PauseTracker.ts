import Layer from "../../../Wolfie2D/Scene/Layer";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Map from "../../../Wolfie2D/DataTypes/Map";
import PauseOverlay from "./PauseOverlay";
import Viewport from "../../../Wolfie2D/SceneGraph/Viewport";
import SceneManager from "../../../Wolfie2D/Scene/SceneManager";
import GameLevel from "../Screens/Levels/GameLevel";

export default class PauseTracker {
  private isPaused: boolean;
  private pauseOverlay: PauseOverlay;
  private scene: Scene;
  private viewport: Viewport;
  private sceneManager: SceneManager;
  private layers: Map<Layer>;
  private playerFrozen: boolean;
  private ghostPlayerFrozen: boolean;
  private level: GameLevel;

  constructor(
    scene: Scene,
    viewport: Viewport,
    layers: Map<Layer>,
    sceneManager: SceneManager
  ) {
    this.scene = scene;
    this.viewport = viewport;
    this.layers = layers;
    this.sceneManager = sceneManager;
    this.isPaused = false;
    this.pauseOverlay = new PauseOverlay(
      scene,
      viewport,
      "pause",
      this,
      sceneManager
    );
    this.level = <GameLevel>scene;
  }

  paused(): boolean {
    return this.isPaused;
  }

  toggle(): boolean {
    let playerNode = this.level
      .getSceneGraph()
      .getNode(this.level.getPlayerID());
    let ghostPlayerNode = this.level
      .getSceneGraph()
      .getNode(this.level.getGhostPlayerID());

    if (!this.isPaused) {
      this.viewport.setZoomLevel(1);
      this.layers.forEach((layer) => {
        this.scene.getLayer(layer).disable();
        this.scene
          .getLayer(layer)
          .getItems()
          .forEach((item) => {
            if (item === playerNode) {
              this.playerFrozen = playerNode.frozen;
            } else if (item === ghostPlayerNode) {
              this.ghostPlayerFrozen = ghostPlayerNode.frozen;
            }
            item.freeze();
          });
      });
      this.pauseOverlay.createPauseOverlay();
    } else {
      this.viewport.setZoomLevel(2);

      this.layers.forEach((layer) => {
        this.scene.getLayer(layer).enable();
        this.scene
          .getLayer(layer)
          .getItems()
          .forEach((item) => {
            if (item === playerNode && this.playerFrozen) {
              // Do nothing if item is the player and player is frozen
            } else if (item === ghostPlayerNode && this.ghostPlayerFrozen) {
              // Do nothing if item is the ghost player and ghost player is frozen
            } else {
              item.unfreeze();
            }
          });
      });
      this.pauseOverlay.removePauseOverlay();
    }

    this.isPaused = !this.isPaused;
    // Return the pause value so we can stop and start game music.
    return this.isPaused;
  }
}
