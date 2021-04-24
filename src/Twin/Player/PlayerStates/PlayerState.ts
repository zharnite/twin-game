import State from "../../../Wolfie2D/DataTypes/State/State";
import StateMachine from "../../../Wolfie2D/DataTypes/State/StateMachine";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Input from "../../../Wolfie2D/Input/Input";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import PlayerController from "../PlayerController";

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

    // Send an input to interact with an object if the E key is pressed.
		if (Input.isJustPressed("interact") && this.owner.onGround) {
			this.handleLeverActivation();
		}
  }


  // Handle collisions for when the player jumps into a coin block.
  handleCoinblockCollision () {
    let pos = this.owner.position.clone();
    // Go up plus some extra
    pos.y -= this.owner.collisionShape.halfSize.y + 10;

    // Find data on the three surrounding blocks
    let tiles = this.findThreeSurroundingBlocks(pos);

    // Determine if we are checking collision for the soul or the body and set values accordingly.
    let coinBlockIDNum = (this.parent.characterType === "soul") ? 41 : 33;
    // Change the block.
    this.changeTileID(pos, tiles, coinBlockIDNum);
  }


  // Handle the player pressing E to activate a lever. 
  handleLeverActivation () {
    let pos = this.owner.position.clone();
    pos.y += this.owner.collisionShape.halfSize.y;

    // Find data on the three surrounding blocks
    let tiles = this.findThreeSurroundingBlocks(pos);

    // Determine if we are checking collision for the soul or the body and set values accordingly.
    let leverBlockIDNum = (this.parent.characterType === "soul" ? 139 : 132);
    // Change the block.
    this.changeTileID(pos, tiles, leverBlockIDNum);
  }

  // ---------------------------------------- HELPER FUNCTIONS ----------------------------------------

  // Helper function to get information on surrounding blocks for the player (Joe's code).
  findThreeSurroundingBlocks(pos: Vec2): number[] {
    pos.x -= 8;
    let tile1 = this.parent.tilemap.getTileAtRowCol(this.parent.tilemap.getColRowAt(pos));
    pos.x += 8;
    let tile2 = this.parent.tilemap.getTileAtRowCol(this.parent.tilemap.getColRowAt(pos));
    pos.x += 8;
    let tile3 = this.parent.tilemap.getTileAtRowCol(this.parent.tilemap.getColRowAt(pos));
    return [tile1, tile2, tile3];
  }


  // Helper function to change the ID of a tile block (Joe's code).
  changeTileID(pos: Vec2, tiles: number[], blockIDNum: number): void {
    let t1 = (tiles[0] === blockIDNum);
    let t2 = (tiles[1] === blockIDNum);
    let t3 = (tiles[2] === blockIDNum);
    let air1 = (tiles[0] === 0);
    let air2 = (tiles[1] === 0);
    let air3 = (tiles[2] === 0);
    let majority = (t1 && t2) || (t1 && t3) || (t2 && t3) || (t1 && t2 && t3);
    let minorityButAir = (t1 && air2 && air3) || (air1 && t2 && air3) || (air1 && air2 && t3);

    // If coin block, change to empty coin block
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
      this.parent.tilemap.setTileAtRowCol(rowCol, blockIDNum + 1);
    }
  }
}
