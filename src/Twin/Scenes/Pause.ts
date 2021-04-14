// Twin TODO (optional) - currently pause is implemented very poorly. there is a lot of duplicated code and it is not modular. make it better.
// Twin TODO (code) - add more pause variables in GameLevel.ts as needed. include whatever state that needs to be saved when resumed.

import Input from "../../Wolfie2D/Input/Input";
import Scene from "../../Wolfie2D/Scene/Scene";
import Controls from "./Controls";
import Credits from "./Credits";
import GameLevel from "./GameLevel";
import Help from "./Help";
import MainMenu from "./MainMenu";
import SceneItemCreator from "./SceneHelpers/SceneItemCreator";
import SceneOptions from "./SceneHelpers/SceneOptions";

export default class Pause extends Scene {
  private init: Record<string, any>;

  loadScene(): void {}

  initScene(init: Record<string, any>): void {
    this.init = init;
  }

  startScene(): void {
    let layer = "Pause";
    this.addUILayer(layer);

    SceneItemCreator.createHeadingLabel(this, this.viewport, layer, layer);
    this.createScreenButtons(layer);
  }

  createScreenButtons(layer: string): void {
    // resume button
    let half = this.viewport.getHalfSize();
    SceneItemCreator.createButton(
      this,
      layer,
      half.x,
      half.y,
      "Resume"
    ).onClick = () => {
      this.sceneManager.changeToScene(
        <any>this.init.level,
        this.init,
        SceneOptions.getSceneOptions()
      );
    };

    // Menu button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      550,
      "Main Menu"
    ).onClick = () => {
      this.sceneManager.changeToScene(MainMenu, {});
    };

    // Controls button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      610,
      "Controls"
    ).onClick = () => {
      this.sceneManager.changeToScene(Controls, this.init);
    };

    // Help button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      670,
      "Help"
    ).onClick = () => {
      this.sceneManager.changeToScene(Help, this.init);
    };

    // Credits button
    SceneItemCreator.createButton(
      this,
      layer,
      1000,
      730,
      "Credits"
    ).onClick = () => {
      this.sceneManager.changeToScene(Credits, this.init);
    };
  }

  updateScene(deltaT: number): void {
    // Resume button
    if (Input.isJustPressed("pause")) {
      this.sceneManager.changeToScene(
        <any>this.init.level,
        this.init,
        SceneOptions.getSceneOptions()
      );
    }
  }
}
