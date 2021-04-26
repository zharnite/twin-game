import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";

export default class Lever  {
    private state: string;
    sprite: AnimatedSprite;
    associatedBlocks: Vec2[];

    constructor (state: string, sprite: AnimatedSprite, associatedBlocks: Vec2[]) {
        this.state = state;
        this.sprite = sprite;
        this.associatedBlocks = associatedBlocks;
    }
    
    setState (newState: string) {
        this.state = newState;
    }

    getState (): string {
        return this.state;
    }
}
