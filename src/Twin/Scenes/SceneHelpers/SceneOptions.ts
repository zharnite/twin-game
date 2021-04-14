/**
 * SceneOptions for Twin game
 */
export default class SceneOptions {
  static sceneOptions = {
    physics: {
      groupNames: ["ground", "player", "enemy", "coin"],
      collisions: [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 0],
        [0, 1, 0, 0],
      ],
    },
  };

  static getSceneOptions(): any {
    if (this.sceneOptions) {
      return this.sceneOptions;
    }
  }
}
