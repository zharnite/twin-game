/**
 * Singleton: Tracks locked / unlocked levels
 */
export default class LevelTracker {
  static levels: object; // level name : boolean (true: unlocked, false: locked)

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

  static unlockAllLevels(): void {
    // Twin TODO
  }
}
