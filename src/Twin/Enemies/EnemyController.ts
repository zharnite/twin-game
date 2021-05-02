import Idle from "./Idle";
import Jump from "./Jump";
import Walk from "./Walk";
import Fly from "./Fly";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import { Events } from "../Enums/EventEnums";

export enum EnemyStates {
  IDLE = "idle",
  WALK = "walk",
  JUMP = "jump",
  PREVIOUS = "previous",
  FLY = "fly",
}

export default class EnemyController extends StateMachineAI {
  owner: GameNode;
  direction: Vec2 = Vec2.ZERO;
  velocity: Vec2 = Vec2.ZERO;
  speed: number = 100;
	flyer: boolean;

  initializeAI(owner: GameNode, options: Record<string, any>) {
    this.owner = owner;
    this.flyer = options.flyer ? options.flyer : false;

    this.receiver.subscribe(Events.PLAYER_MOVE);

    // Only need to initialize Fly if the enemy is a flier.
    if (!this.flyer) {
      let idle = new Idle(this, owner);
      this.addState(EnemyStates.IDLE, idle);
      let walk = new Walk(this, owner);
      this.addState(EnemyStates.WALK, walk);
      let jump = new Jump(this, owner);
      this.addState(EnemyStates.JUMP, jump);
      this.initialize(EnemyStates.IDLE);
    }
    else {
      let fly = new Fly(this, owner);
      this.addState(EnemyStates.FLY, fly);
      this.initialize(EnemyStates.FLY);
    }
  }

  changeState(stateName: string): void {
    if (stateName === EnemyStates.JUMP) {
      this.stack.push(this.stateMap.get(stateName));
    }
    super.changeState(stateName);
  }

  update(deltaT: number): void {
    super.update(deltaT);
  }
}
