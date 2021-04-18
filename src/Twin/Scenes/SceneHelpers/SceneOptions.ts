import { PlayerTypes } from "../Enums/PlayerEnums";

/**
 * SceneOptions for Twin game
 *
 *      g  p  gp e  c
 * g    0  1  1  1  0
 * p    1  0  0  0  1
 * gp   1  0  0  0  1
 * e    1  0  0  0  0
 * c    0  1  1  0  0
 *
 */
export default class SceneOptions {
  static sceneOptions = {
    physics: {
      groupNames: [
        "ground",
        PlayerTypes.PLAYER,
        PlayerTypes.GHOST_PLAYER,
        "enemy",
        "coin",
      ],
      collisions: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
      ],
    },
  };

  static getSceneOptions(): any {
    if (this.sceneOptions) {
      return this.sceneOptions;
    }
  }
}
