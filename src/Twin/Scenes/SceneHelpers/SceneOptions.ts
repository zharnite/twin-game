import { GroupTypes } from "../Enums/GroupEnums";
import { PlayerTypes } from "../Enums/PlayerEnums";

export default class SceneOptions {
  static sceneOptions = {
    physics: {
      groupNames: [
        GroupTypes.GROUND,
        GroupTypes.PLAYER_GROUND,
        GroupTypes.GHOST_GROUND,
        PlayerTypes.PLAYER,
        PlayerTypes.GHOST_PLAYER,
        GroupTypes.ENEMY,
        GroupTypes.PLAYER_ENEMY,
        GroupTypes.GHOST_ENEMY,
        GroupTypes.COIN,
        GroupTypes.PLAYER_COIN,
        GroupTypes.GHOST_COIN,
      ],
      collisions: [
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
        [1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0],
        [1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      ],
    },
  };

  static getSceneOptions(): any {
    if (this.sceneOptions) {
      return this.sceneOptions;
    }
  }
}
