import State from "../../../Wolfie2D/DataTypes/State/State";
import StateMachine from "../../../Wolfie2D/DataTypes/State/StateMachine";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Input from "../../../Wolfie2D/Input/Input";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import PlayerController from "../PlayerController";
import { Events } from "../../Enums/EventEnums";

export default abstract class PlayerState extends State {
  owner: GameNode;
  gravity: number = 800;
  parent: PlayerController;

  constructor(parent: StateMachine, owner: GameNode) {
    super(parent);
    this.owner = owner;
  }

  getInputDirection(): Vec2 {
    let direction = Vec2.ZERO;
    direction.x =
      (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
    direction.y = Input.isJustPressed("jump") ? -1 : 0;
    return direction;
  }

  update(deltaT: number): void {
    // Do gravity.
    this.parent.velocity.y += this.gravity * deltaT;
  }

  protected playerHitCeiling(): void {
    this.emitter.fireEvent(Events.PLAYER_HIT_CEILING, {
      position: this.owner.position.clone(),
      id: this.owner.id,
    });
  }

  protected playerOnGround(): void {
    this.emitter.fireEvent(Events.PLAYER_ON_GROUND, {
      position: this.owner.position.clone(),
      id: this.owner.id,
    });
  }
}
