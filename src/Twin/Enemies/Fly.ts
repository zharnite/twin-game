import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import EnemyState from "./EnemyState";

export default class Fly extends EnemyState {
    verticalFlyDirection: string;
	
	onEnter(): void {
        if(this.parent.direction.isZero()){
			this.parent.direction = new Vec2(-1, 0);
			(<AnimatedSprite>this.owner).invertX = true;
		}
		(<AnimatedSprite>this.owner).animation.play("FLY", true);
        this.verticalFlyDirection = "up";
	}

	update(deltaT: number): void {
		super.update(deltaT);
        
		this.parent.velocity.x = this.parent.direction.x * this.parent.speed;

        // Make the hellhawk oscillate up and down a bit
        if (this.verticalFlyDirection === "up") {
            this.parent.velocity.y -= 1;
            if (this.parent.velocity.y <= -50) {
                this.verticalFlyDirection = "down";
            }
        }
        else {
            this.parent.velocity.y += 1;
            if (this.parent.velocity.y >= 50) {
                this.verticalFlyDirection = "up";
            }
        }

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		(<AnimatedSprite>this.owner).animation.stop();
		return {};
	}
}