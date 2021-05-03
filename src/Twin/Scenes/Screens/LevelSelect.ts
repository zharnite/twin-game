import Scene from "../../../Wolfie2D/Scene/Scene";
import LevelTracker from "../SceneHelpers/LevelTracker";
import SceneItemCreator from "../SceneHelpers/SceneItemCreator";
import Input from "../../../Wolfie2D/Input/Input";
import SceneOptions from "../SceneHelpers/SceneOptions";
import { Screens } from "../Enums/ScreenEnums";
import InfoScreenCreator from "../SceneHelpers/InfoScreenCreator";
import { ScreenTexts } from "../Enums/ScreenTextEnums";
import { Levels } from "../Enums/LevelEnums";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";

export default class LevelSelect extends Scene {
  private layer: string;
  private stringToLevelMap: { [level in Levels]: object }; // string to level object
  private levelUnlockedMap: { [level in Levels]: boolean }; // string to boolean
  private sceneOptionsObject: any;
  private half: Vec2;

  loadScene(): void {
    // Load click sfx
    this.load.audio("menuButton", "assets/sounds/sfx/menuButton.mp3"); 
  }

  startScene(): void {
    // Create LevelSelect layer
    this.layer = Screens.LEVEL_SELECT;
    this.addUILayer(this.layer);

    // Create heading and return button
    this.createHeadingAndReturn();

    // Get maps from LevelTracker
    this.levelUnlockedMap = LevelTracker.getLevels();
    this.stringToLevelMap = LevelTracker.getStringToLevels();

    // Get the scene options
    this.sceneOptionsObject = SceneOptions.getSceneOptions();

    // Viewport half size for button placement
    this.half = this.viewport.getHalfSize();

    // Buttons for each level
    this.createLevelButtons();
  }

  private createHeadingAndReturn(): void {
    let isc = new InfoScreenCreator(
      this,
      this.viewport,
      this.layer,
      this.sceneManager,
      this.emitter
    );
    isc.createHeading(ScreenTexts.LEVEL_SELECT);
    isc.createReturnButton();
  }

  private createLevelButtons(): void {
    let rows = LevelTracker.rows;
    let cols = LevelTracker.cols;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let index = i * cols + j + 1;
        let levelText = ScreenTexts.LEVEL + " " + index;
        let levelID = <Levels>(ScreenTexts.LEVEL_CAPITALIZED + " " + index);
        this.createLevelButton(levelText, levelID, j, i);
      }
    }

    // Final level
    this.createLevelButton(
      ScreenTexts.FINAL_LEVEL,
      Levels.FINAL_LEVEL,
      1,
      rows + 1
    );
  }

  private createLevelButton(
    levelText: string,
    levelID: Levels,
    xOffset: number,
    yOffset: number
  ): void {
    // Button location variables
    let x = this.half.x / 2;
    let y = this.half.y / 2;
    let xSpace = this.half.x / 2;
    let ySpace = this.half.y / 4;

    // Create the button
    let button = SceneItemCreator.createLevelButton(
      this,
      this.layer,
      x + xSpace * xOffset,
      y + ySpace * yOffset,
      levelText,
      this.levelUnlockedMap[levelID]
    );

    // Allow onClick for unlocked levels only
    if (this.levelUnlockedMap[levelID]) {
      button.onClick = () => {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menuButton"});
        this.sceneManager.changeToScene(
          <any>this.stringToLevelMap[levelID],
          {},
          this.sceneOptionsObject
        );
      };
    }
  }

  updateScene(deltaT: number): void {
    super.updateScene(deltaT);

    if (Input.isPressed("unlock")) {
      if (LevelTracker.unlockAllLevels()) {
        this.sceneManager.changeToScene(LevelSelect, {});
      }
    }
  }
}
