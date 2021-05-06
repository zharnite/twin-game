import { Levels } from "../Enums/LevelEnums";
import Level1 from "../Screens/Levels/Level1";
import Level2 from "../Screens/Levels/Level2";
import Level3 from "../Screens/Levels/Level3";
import Level4 from "../Screens/Levels/Level4";
import Level5 from "../Screens/Levels/Level5";
import Level6 from "../Screens/Levels/Level6";
import FinalLevel from "../Screens/Levels/FinalLevel";

export default class LevelTracker {
  static levels: { [level in Levels]: boolean }; // level name : boolean (true: unlocked, false: locked)
  static cheatCodePressed: boolean; // whether or not cheat code key was pressed
  static stringToLevels: { [level in Levels]: object }; // String to Level Map
  static rows: number = 2;
  static cols: number = 3;

  static getLevels(): { [level in Levels]: boolean } {
    if (!this.levels) {
      this.initLevels();
    }
    return this.levels;
  }

  static getStringToLevels(): { [level in Levels]: object } {
    if (!this.stringToLevels) {
      this.stringToLevels = {
        [Levels.LEVEL_1]: Level1,
        [Levels.LEVEL_2]: Level2,
        [Levels.LEVEL_3]: Level3,
        [Levels.LEVEL_4]: Level4,
        [Levels.LEVEL_5]: Level5,
        [Levels.LEVEL_6]: Level6,
        [Levels.FINAL_LEVEL]: FinalLevel,
        [Levels.COMPLETE]: null,
      };
    }
    return this.stringToLevels;
  }

  /**
   * Unlocks levels and returns true. If the cheat code was already executed, returns false.
   * @returns boolean whether or not levels have been unlocked
   */
  static unlockAllLevels(): boolean {
    if (this.cheatCodePressed === true) {
      return false;
    }

    this.cheatCodePressed = true;
    this.levels = {
      [Levels.LEVEL_1]: true,
      [Levels.LEVEL_2]: true,
      [Levels.LEVEL_3]: true,
      [Levels.LEVEL_4]: true,
      [Levels.LEVEL_5]: true,
      [Levels.LEVEL_6]: true,
      [Levels.FINAL_LEVEL]: true,
      [Levels.COMPLETE]: true,
    };

    return true;
  }

  /**
   * Unlocks a level
   * @param level Level to unlock
   */
  static unlockLevel(level: Levels) {
    this.levels[level] = true;
  }

  static isLevelComplete(level: Levels) {
    if (!this.levels) {
      this.initLevels();
    }
    return LevelTracker.levels[level];
  }

  static isGameComplete() {
    return this.isLevelComplete(Levels.COMPLETE);
  }

  static initLevels() {
    this.levels = {
      [Levels.LEVEL_1]: true,
      [Levels.LEVEL_2]: false,
      [Levels.LEVEL_3]: false,
      [Levels.LEVEL_4]: false,
      [Levels.LEVEL_5]: false,
      [Levels.LEVEL_6]: false,
      [Levels.FINAL_LEVEL]: false,
      [Levels.COMPLETE]: false,
    };
  }
}
