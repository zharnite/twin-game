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
        "Level 1": true,
        "Level 2": false,
        "Level 3": false,
        "Level 4": false,
        "Level 5": false,
        "Level 6": false,
        "Final Level": false,
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
      "Level 1": true,
      "Level 2": true,
      "Level 3": true,
      "Level 4": true,
      "Level 5": true,
      "Level 6": true,
      "Final Level": true,
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
