import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import InAir from "./InAir";

export default class Fall extends InAir {
  owner: AnimatedSprite;

  onEnter(options: Record<string, any>): void {
    this.owner.animation.play("FALL", true);
  }

  handleInput(event: GameEvent): void {}

  update(deltaT: number): void {
    super.update(deltaT);
    if (this.parent.characterType === "soul") {
      this.parent.velocity.y *= 0.9;
    }
  }

  onExit(): Record<string, any> {
    this.owner.animation.stop();
    return {};
  }
}
