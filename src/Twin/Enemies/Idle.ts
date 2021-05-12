import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { Events } from "../Enums/EventEnums";
import { EnemyStates } from "./EnemyController";
import OnGround from "./OnGround";

/**
 * The idle enemy state. Enemies don't do anything until the player comes near them.
 */
export default class Idle extends OnGround {

  onEnter(): void {
    this.parent.speed = this.parent.speed;
    (<AnimatedSprite>this.owner).animation.play("IDLE", true);
  }

  onExit(): Record<string, any> {
    (<AnimatedSprite>this.owner).animation.stop();
    return {};
  }

  // If the body player is close enough, the boar will start walking.
  handleInput(event: GameEvent) {
    if (event.type === Events.PLAYER_MOVE) {
      let playerPos = event.data.get("position");
      let playerType = event.data.get("imageId");
      if (
        Math.abs(this.owner.position.x - playerPos.x) < 16 * this.PLAYER_DETECTION_RADIUS && 
        Math.abs(this.owner.position.y - playerPos.y) < 12 * this.PLAYER_DETECTION_RADIUS &&
        playerType === "PlatformPlayer"
      ) {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "boar", loop: false, holdReference: false});
        this.finished(EnemyStates.WALK);
      }
    }
  }

  update(deltaT: number): void {
    super.update(deltaT);

    this.parent.velocity.x = 0;

    this.owner.move(this.parent.velocity.scaled(deltaT));
  }
}
