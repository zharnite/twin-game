import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { EnemyStates } from "./EnemyController";
import EnemyState from "./EnemyState";

export default class OnGround extends EnemyState {
	onEnter(): void {}

	handleInput(event: GameEvent): void {
		super.handleInput(event);
	}

	update(deltaT: number): void {
		if(this.parent.velocity.y > 0){
			this.parent.velocity.y = 0;
		}
		super.update(deltaT);
	}

	onExit(): Record<string, any> {
		return {};
	}
}