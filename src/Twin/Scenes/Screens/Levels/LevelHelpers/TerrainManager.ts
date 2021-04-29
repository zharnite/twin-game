import {
  TiledLayerData,
  TiledTilemapData,
} from "../../../../../Wolfie2D/DataTypes/Tilesets/TiledData";
import Vec2 from "../../../../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../../../../Wolfie2D/Nodes/Graphics/Rect";
import OrthogonalTilemap from "../../../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Color from "../../../../../Wolfie2D/Utils/Color";
import { Events } from "../../../../Enums/EventEnums";
import PlayerController from "../../../../Player/PlayerController";
import { PlayerTypes } from "../../../Enums/PlayerEnums";
import GameLevel from "../GameLevel";
import { Terrains } from "./Enums/TerrainEnums";
import { TilemapLayers } from "./Enums/TilemapLayerEnums";

export default class TerrainManager {
  // Class variables
  private level: GameLevel;
  private tilemapName: string;
  private tilemap: TiledTilemapData;
  private orthogonalTilemap: OrthogonalTilemap;

  // Static variables
  private singleBlockSize: Vec2;
  private scaleFactor: number;

  // Level specific variables
  // Entrance and exit locations
  private bodyEntranceLocation: Vec2;
  private bodyExitLocation: Vec2;
  private soulEntranceLocation: Vec2;
  private soulExitLocation: Vec2;
  // Exits
  public levelEndAreas: { [character: string]: Rect };
  // Levers
  public levelLeverAreas: { [character: number]: Rect };
  public leverToDoorsMap: Map<number, Vec2[]>;

  constructor(level: GameLevel, tilemapName: string) {
    // Class variables
    this.level = level;
    this.tilemapName = tilemapName;
    this.tilemap = this.level.load.getTilemap(this.tilemapName);

    // Static variables
    this.scaleFactor = this.tilemap.tilewidth * 2;
    this.singleBlockSize = new Vec2(1, 1);

    console.log(this.tilemap);
  }

  /**
   * Parses all tiles and sets up properties of the tiles
   * List of servies provided:
   *  - Sets up doors: spawn location, exit location, level progression
   */
  public parseTilemap(): void {
    this.parseDoors();
    this.parseLeversAndLeverDoors();
    // this.parseCoinBlocks();
  }

  /**
   * Returns the specified exit location.
   */
  public getExitLocation(type: string): Vec2 {
    return (type === "body") ? this.bodyExitLocation : this.soulExitLocation;
  }

  /**
   * Parses entrance and exits
   */
  private parseDoors(): void {
    this.levelEndAreas = {};

    let tiles = this.getLayerTiles(TilemapLayers.DOORS);

    // Parse each relevant tile
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === Terrains.BODY_ENTRANCE) {
        this.bodyEntranceLocation = this.getLocationFromIndex(i);
      } else if (tiles[i] === Terrains.BODY_EXIT) {
        this.bodyExitLocation = this.getLocationFromIndex(i);
      } else if (tiles[i] === Terrains.SOUL_ENTRANCE) {
        this.soulEntranceLocation = this.getLocationFromIndex(i);
      } else if (tiles[i] === Terrains.SOUL_EXIT) {
        this.soulExitLocation = this.getLocationFromIndex(i);
      }
    }

    // Initialize spawn and exit locations
    this.setSpawnLocations();
    this.setExitLocations();
  }

  private setSpawnLocations(): void {
    // Modify entrance location to be centered for the player's spawn point
    let bodySpawn = new Vec2(
      this.bodyEntranceLocation.x + 0.5,
      this.bodyEntranceLocation.y
    );
    let soulSpawn = new Vec2(
      this.soulEntranceLocation.x + 0.5,
      this.soulEntranceLocation.y
    );

    // Scale the spawn locations to the game size
    bodySpawn.scale(this.scaleFactor);
    soulSpawn.scale(this.scaleFactor);

    // Set spawn locations
    this.level.setPlayerSpawn(bodySpawn, true);
    this.level.setGhostPlayerSpawn(soulSpawn, true);
  }

  private setExitLocations(): void {
    // Modify exit location to be centered
    this.bodyExitLocation
      .add(this.singleBlockSize.scaled(0.5))
      .scale(this.scaleFactor);
    this.soulExitLocation
      .add(this.singleBlockSize.scaled(0.5))
      .scale(this.scaleFactor);

    // Add the exit locations
    this.addExit(
      this.bodyExitLocation,
      this.singleBlockSize.scaled(this.scaleFactor),
      PlayerTypes.PLAYER
    );
    this.addExit(
      this.soulExitLocation,
      this.singleBlockSize.scaled(this.scaleFactor),
      PlayerTypes.GHOST_PLAYER
    );
  }

  /**
   * Parses levers and lever doors
   */
  private parseLeversAndLeverDoors(): void {
    this.levelLeverAreas = {};
    this.leverToDoorsMap = new Map();

    let levers = this.getLayerTiles(TilemapLayers.LEVERS);
    let leverDoors = this.getLayerTiles(TilemapLayers.LEVER_DOORS);

    // Levers
    for (let i = 0; i < levers.length; i++) {
      if (levers[i] === Terrains.LEVER1_ON) {
        // Both body and soul can interact with lever 1
        this.addLever(
          levers[i],
          this.getLocationFromIndex(i)
            .add(this.singleBlockSize.scaled(0.5))
            .scale(this.scaleFactor),
          this.singleBlockSize.scaled(this.scaleFactor),
          [PlayerTypes.PLAYER, PlayerTypes.GHOST_PLAYER]
        );
      } else if (levers[i] === Terrains.LEVER2_ON) {
        // Only body can interact with lever 2
        this.addLever(
          levers[i],
          this.getLocationFromIndex(i)
            .add(this.singleBlockSize.scaled(0.5))
            .scale(this.scaleFactor),
          this.singleBlockSize.scaled(this.scaleFactor),
          [PlayerTypes.PLAYER]
        );
      } else if (levers[i] === Terrains.LEVER3_ON) {
        // Only soul can interact with lever 3
        this.addLever(
          levers[i],
          this.getLocationFromIndex(i)
            .add(this.singleBlockSize.scaled(0.5))
            .scale(this.scaleFactor),
          this.singleBlockSize.scaled(this.scaleFactor),
          [PlayerTypes.GHOST_PLAYER]
        );
      }
    }

    // Lever doors
    for (let i = 0; i < leverDoors.length; i++) {
      if (
        leverDoors[i] === Terrains.LEVER1_DOOR_LOCKED ||
        leverDoors[i] === Terrains.LEVER2_DOOR_LOCKED ||
        leverDoors[i] === Terrains.LEVER3_DOOR_LOCKED
      ) {
        let key = leverDoors[i] - 2;
        let doors: Vec2[] = [];
        if (this.leverToDoorsMap.has(key)) {
          doors = this.leverToDoorsMap.get(key);
        } else {
          this.leverToDoorsMap.set(key, doors);
        }

        let location = this.getWorldLocationFromIndex(i);
        doors.push(location);
      }
    }

    // ZHEN TODO - Lever doors background

    console.log(this.leverToDoorsMap);
  }

  /****** HELPERS ******/

  /**
   * Gets all tiles for a layer
   * @param name The layer's name (Main, Background, Doors)
   * @returns Array of tile ids for the given layer name
   */
  private getLayerTiles(name: string): number[] {
    let layers = this.tilemap.layers;
    let layer = layers.filter((layer) => layer.name === name)[0];
    let tiles: number[] = [];
    if (layer) {
      tiles = layer.data;
    }
    return tiles;
  }

  /**
   * Gets the world location coordinates based on the tile index
   * @param index Tile index from the current level's tilemap
   * @returns col and row corresponding to the index
   */
  private getWorldLocationFromIndex(index: number): Vec2 {
    let n = this.tilemap.width;
    let row = Math.floor(index / n);
    let col = index % n;
    return new Vec2(col, row)
      .add(this.singleBlockSize.scaled(0.5))
      .scale(this.scaleFactor);
  }

  /**
   * Gets the location coordinates based on the tile index
   * @param index Tile index from the current level's tilemap
   * @returns col and row corresponding to the index
   */
  private getLocationFromIndex(index: number): Vec2 {
    let n = this.tilemap.width;
    let row = Math.floor(index / n);
    let col = index % n;
    return new Vec2(col, row);
  }

  private getLocationFromWorldLocation(worldCoords: Vec2): Vec2 {
    let coord = worldCoords
      .scaled(1 / this.scaleFactor)
      .add(this.singleBlockSize.scaled(-0.5));

    return coord;
  }

  private getIndexFromLocation(coord: Vec2): number {
    return coord.y * this.tilemap.width + coord.x;
  }

  /**
   * ZHEN TODO
   * - change tile at index i to a different index (for toggle lever and coin block)
   * - get tile above, below, right, left of Vec2
   * - get overlapping tiles (at most 2 tiles) above, below, right, left of Vec2
   * - find world location (round position to world index)
   * - set new world location by modifying x and y
   * - get location from world location, get index from location
   * - tab, view
   */

  /****** SCENE ADDERS ******/
  private addExit(startingTile: Vec2, size: Vec2, group: string): void {
    let levelEndArea = <Rect>this.level.add.graphic(
      GraphicType.RECT,
      "primary",
      {
        position: startingTile,
        size: size,
      }
    );
    levelEndArea.color = Color.TRANSPARENT;
    levelEndArea.addPhysics(undefined, undefined, false, true);
    levelEndArea.setTrigger(group, Events.PLAYER_ENTERED_LEVEL_END, null);
    this.levelEndAreas[group] = levelEndArea;
  }

  private addLever(
    leverType: number,
    startingTile: Vec2,
    size: Vec2,
    groups: string[]
  ): void {
    let lever = <Rect>this.level.add.graphic(GraphicType.RECT, "primary", {
      position: startingTile,
      size: size,
    });
    lever.color = Color.TRANSPARENT;
    lever.addPhysics(undefined, undefined, false, true);
    groups.forEach((group) =>
      lever.setTrigger(group, Events.PLAYER_OVERLAPS_LEVER, null)
    );
    this.levelLeverAreas[leverType] = lever;
  }

  /*** TILE MODIFIERS ***/

  /*** LEVERS ***/
  public toggleLever(nodeid: number, leverid: number): void {
    // If id is odd (on / locked), go up
    // If id is even (off / unlocked), go down
    if (leverid % 2 === 0) {
      this.toggleLeverOn(leverid);
    } else {
      this.toggleLeverOff(leverid);
    }

    // ZHEN TODO - Toggle both doors and door backgrounds
  }

  private toggleLeverOn(leverid: number) {
    // Turn on the lever: (off / unlocked / even) -> (on / locked / odd)
    let leverLayer = this.getLayerTiles(TilemapLayers.LEVERS);
    let leverDoorLayer = this.getLayerTiles(TilemapLayers.LEVER_DOORS);
    let leverDoorBGLayer = this.getLayerTiles(
      TilemapLayers.LEVER_DOORS_BACKGROUND
    );
    let leverOnID = leverid - 1;
    let leverOffID = leverid;
    let lockedDoorID = leverid + 1;
    let unlockedDoorID = leverid + 2;

    // Update lever
    let leverArea = this.levelLeverAreas[leverOffID];
    let leverLocation = this.getLocationFromWorldLocation(leverArea.position);
    let index = this.getIndexFromLocation(leverLocation);
    // Update levelLeverAreas
    this.levelLeverAreas[leverOnID] = leverArea;
    this.levelLeverAreas[leverOffID] = null;

    // Update lever doors
    let doors = this.leverToDoorsMap.get(leverOffID);
    doors.forEach((door) => {
      let index = this.getIndexFromLocation(
        this.getLocationFromWorldLocation(door)
      );
      leverDoorLayer[index] = lockedDoorID; // set door
      leverDoorBGLayer[index] = 0; // clear unlocked door
    });
    // Update leverToDoorsMap
    this.leverToDoorsMap.set(leverOnID, doors);
    this.leverToDoorsMap.delete(leverOffID);
  }

  private toggleLeverOff(leverid: number) {
    // Turn off the lever: (on / locked / odd) -> (off / unlocked / even)
    let leverLayer = this.getLayerTiles(TilemapLayers.LEVERS);
    let leverDoorLayer = this.getLayerTiles(TilemapLayers.LEVER_DOORS);
    let leverDoorBGLayer = this.getLayerTiles(
      TilemapLayers.LEVER_DOORS_BACKGROUND
    );
    let leverOnID = leverid;
    let leverOffID = leverid + 1;
    let lockedDoorID = leverid + 2;
    let unlockedDoorID = leverid + 3;

    // Update lever
    let leverArea = this.levelLeverAreas[leverOnID];
    let leverLocation = this.getLocationFromWorldLocation(leverArea.position);
    let index = this.getIndexFromLocation(leverLocation);
    leverLayer[index] = leverOffID;
    // Update levelLeverAreas
    this.levelLeverAreas[leverOffID] = leverArea;
    this.levelLeverAreas[leverOnID] = null;

    // Update lever doors
    let doors = this.leverToDoorsMap.get(leverOnID);
    doors.forEach((door) => {
      let index = this.getIndexFromLocation(
        this.getLocationFromWorldLocation(door)
      );
      leverDoorLayer[index] = 0; // clear door
      leverDoorBGLayer[index] = unlockedDoorID; // set unlocked door
    });
    // Update leverToDoorsMap
    this.leverToDoorsMap.set(leverOffID, doors);
    this.leverToDoorsMap.delete(leverOnID);
  }
}
