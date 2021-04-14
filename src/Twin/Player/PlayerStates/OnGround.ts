import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Input from "../../../Wolfie2D/Input/Input";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import PlayerState from "./PlayerState";

export default class OnGround extends PlayerState {
  onEnter(options: Record<string, any>): void {}

  handleInput(event: GameEvent): void {}

  update(deltaT: number): void {
    if (this.parent.velocity.y > 0) {
      this.parent.velocity.y = 0;
    }
    super.update(deltaT);

    let direction = this.getInputDirection();

    if (direction.x !== 0) {
      (<Sprite>this.owner).invertX = MathUtils.sign(direction.x) < 0;
    }

    if (Input.isJustPressed("jump")) {
      this.finished("jump");
      // Change jump height based on if the jumping character is the soul or body.
      if (this.parent.characterType === "body") {
        this.parent.velocity.y = -350;
      } else {
        this.parent.velocity.y = -550;
      }
      if (this.parent.velocity.x !== 0) {
        // We don't need this silly flip right now.
        // this.owner.tweens.play("flip");
      }
    } else if (!this.owner.onGround) {
      this.finished("jump");
    }
  }

  onExit(): Record<string, any> {
    return {};
  }
}
