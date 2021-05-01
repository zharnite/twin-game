import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { EnemyStates } from "./EnemyController";
import OnGround from "./OnGround";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { Events } from "../Enums/EventEnums";

export default class Walk extends OnGround {
	time: number;
	
	onEnter(): void {
		if(this.parent.direction.isZero()){
			this.parent.direction = new Vec2(-1, 0);
			(<AnimatedSprite>this.owner).invertX = true;
		}

		(<AnimatedSprite>this.owner).animation.play("WALK", true);

		this.time = Date.now();
	}

	update(deltaT: number): void {
		super.update(deltaT);

		this.parent.velocity.x = this.parent.direction.x * this.parent.speed;

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	// If the body player is close enough, the boar will start walking.
	handleInput(event: GameEvent) {
		if (event.type === Events.PLAYER_MOVE) {
			let playerPos = event.data.get("position");
			let playerType = event.data.get("imageId");
			if (
				Math.abs(this.owner.position.x - playerPos.x) > 16 * this.PLAYER_DETECTION_RADIUS && 
				Math.abs(this.owner.position.y - playerPos.y) > 8 * this.PLAYER_DETECTION_RADIUS &&
				playerType === "PlatformPlayer"
			) {
				this.finished(EnemyStates.IDLE);
			}
		}
	}

	onExit(): Record<string, any> {
		(<AnimatedSprite>this.owner).animation.stop();
		return {};
	}
}