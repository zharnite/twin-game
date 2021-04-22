import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default abstract class InAir extends PlayerState {
  update(deltaT: number): void {
    super.update(deltaT);

    let dir = this.getInputDirection();

    // NOTE: I have switched back to the original code here and it seems to work!

    // This line is the wall bug.
    this.parent.velocity.x +=
      (dir.x * this.parent.speed) / 3.5 - 0.3 * this.parent.velocity.x;

    // This works
    // this.parent.velocity.x = dir.x * this.parent.speed;

    // This seems to help with the wall clip bug.
    if (this.owner.onWall) {
      this.parent.velocity.x = 0;
    }
    this.owner.move(this.parent.velocity.scaled(deltaT));

    if (this.owner.onGround) {
      this.finished(PlayerStates.PREVIOUS);
    }
  }
}
