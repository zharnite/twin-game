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

    if (this.owner.onGround) {
      this.handleSpikeCollision();
    }
  }


  // Handle collisions for when the player jumps into a coin block.
  handleCoinblockCollision () {
    let pos = this.owner.position.clone();
    // Go up plus some extra
    pos.y -= this.owner.collisionShape.halfSize.y + 10;

    // Determine if we are checking collision for the soul or the body and set values accordingly.
    let coinBlockIDNum = (this.parent.characterType === "soul") ? 41 : 33;

    // Find data on the three surrounding blocks
    let rowCol = this.findCorrectBlock(pos, coinBlockIDNum);

    if (rowCol.x !== 0 && rowCol.y !== 0) {
      this.parent.tilemap.setTileAtRowCol(rowCol, coinBlockIDNum + 1);
    }
  }


  // Handle collisions between the player and spikes on the ground.
  handleSpikeCollision () {
    let pos = this.owner.position.clone();
    // Go down plus some extra
    pos.y += this.owner.collisionShape.halfSize.y;

    // Determine if we are checking collision for the soul or the body and set values accordingly.
    let spikeBlockIDNum = (this.parent.characterType === "soul") ? 141 : 134;

    // Find data on the three surrounding blocks
    let rowCol = this.findCorrectBlock(pos, spikeBlockIDNum);

    if (rowCol.x !== 0 && rowCol.y !== 0) {
      this.emitter.fireEvent(Events.PLAYER_HIT_SPIKE);
    }
  }

  // ---------------------------------------- HELPER FUNCTIONS ----------------------------------------

  // Helper function to get information on surrounding blocks for the player (Joe's code).
  findCorrectBlock(pos: Vec2, blockIDNum: number): Vec2 {
    pos.x -= 8;
    let tile1 = this.parent.tilemap.getTileAtRowCol(this.parent.tilemap.getColRowAt(pos));
    pos.x += 8;
    let tile2 = this.parent.tilemap.getTileAtRowCol(this.parent.tilemap.getColRowAt(pos));
    pos.x += 8;
    let tile3 = this.parent.tilemap.getTileAtRowCol(this.parent.tilemap.getColRowAt(pos));
    let t1 = (tile1 === blockIDNum);
    let t2 = (tile2 === blockIDNum);
    let t3 = (tile3 === blockIDNum);
    let air1 = (tile1 === 0);
    let air2 = (tile2 === 0);
    let air3 = (tile3 === 0);
    let majority = (t1 && t2) || (t1 && t3) || (t2 && t3) || (t1 && t2 && t3);
    let minorityButAir = (t1 && air2 && air3) || (air1 && t2 && air3) || (air1 && air2 && t3);

    // Find the correct row and column of the block, if it exists.
    let rowCol;
    if (majority || minorityButAir) {
      if (minorityButAir) {
        // Get the correct position
        if (t1) { pos.x -= 32; } 
        else if (t2) { pos.x -= 16; }
        rowCol = this.parent.tilemap.getColRowAt(pos);
      } 
      else {
        pos.x -= 16;
        rowCol = this.parent.tilemap.getColRowAt(pos);
      }
      return rowCol;
    }
    return new Vec2(0, 0);
  }


}
