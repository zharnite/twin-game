/**
 * Singleton: Tracks locked / unlocked levels
 */
export default class LevelTracker {
  static levels: { [level: string]: boolean }; // level name : boolean (true: unlocked, false: locked)
  static cheatCodePressed: boolean; // whether or not cheat code key was pressed

  static getLevels(): { [level: string]: boolean } {
    // First time getting level tracker's levels
    if (!this.levels) {
      this.levels = {
        "LEVEL 1": true,
        "LEVEL 2": false,
        "LEVEL 3": false,
        "LEVEL 4": false,
        "LEVEL 5": false,
        "LEVEL 6": false,
        "FINAL LEVEL": false,
      };
    }

    // Other times getting levels
    return <{ [level: string]: boolean }>this.levels;
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
      "LEVEL 1": true,
      "LEVEL 2": true,
      "LEVEL 3": true,
      "LEVEL 4": true,
      "LEVEL 5": true,
      "LEVEL 6": true,
      "FINAL LEVEL": true,
    };

    return true;
  }

  /**
   * Unlocks a level
   * @param level Level to unlock
   */
  static unlockLevel(level: string) {
    this.levels[level] = true;
  }
}
