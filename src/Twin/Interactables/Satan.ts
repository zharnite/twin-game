import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";

export default class Satan {
  private state: string;
  public sprite: AnimatedSprite;
  private requiredCoinValue: number;

  constructor(
    state: string,
    sprite: AnimatedSprite,
    requiredCoinValue: number
  ) {
    this.state = state;
    this.sprite = sprite;
    this.requiredCoinValue = requiredCoinValue;
  }

  // Waiting / Accepted
  setState(newState: string): void {
    this.state = newState;
  }

  getState(): string {
    return this.state;
  }

  setRequiredCoinValue(value: number): void {
    this.requiredCoinValue = value;
  }

  getRequiredCoinValue(): number {
    return this.requiredCoinValue;
  }

  setTilePosition(tilePos: Vec2): void {
    this.sprite.position.set(tilePos.x * 32, tilePos.y * 32);
  }
}
