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
  public leverToDoorsMap: Map<number, number[][]>; // Lever id to list of indexes of doors and door bgs on tilemap

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
    return type === "body" ? this.bodyExitLocation : this.soulExitLocation;
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

    // Levers
    let levers = this.getLayerTiles(TilemapLayers.LEVERS);
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

    // Lever doors and level door backgrounds
    let leverDoors = this.getLayerTiles(TilemapLayers.LEVER_DOORS);
    let leverDoorsBackground = this.getLayerTiles(
      TilemapLayers.LEVER_DOORS_BACKGROUND
    );
    for (let i = 0; i < leverDoors.length; i++) {
      // lever doors
      if (
        leverDoors[i] === Terrains.LEVER1_DOOR_LOCKED ||
        leverDoors[i] === Terrains.LEVER2_DOOR_LOCKED ||
        leverDoors[i] === Terrains.LEVER3_DOOR_LOCKED
      ) {
        let key = leverDoors[i] - 2;
        this.addDoorToMapWithKey(key, i, "door");
      }

      // lever door background
      else if (
        leverDoorsBackground[i] === Terrains.LEVER1_DOOR_UNLOCKED ||
        leverDoorsBackground[i] === Terrains.LEVER2_DOOR_UNLOCKED ||
        leverDoorsBackground[i] === Terrains.LEVER3_DOOR_UNLOCKED
      ) {
        let key = leverDoorsBackground[i] - 3;
        this.addDoorToMapWithKey(key, i, "doorbg");
      }
    }
  }

  private addDoorToMapWithKey(
    key: number,
    door: number,
    identifier: string
  ): void {
    let doorsAndDoorsBG: number[][] = [];
    doorsAndDoorsBG[0] = [];
    doorsAndDoorsBG[1] = [];

    if (this.leverToDoorsMap.has(key)) {
      doorsAndDoorsBG = this.leverToDoorsMap.get(key);
    } else {
      this.leverToDoorsMap.set(key, doorsAndDoorsBG);
    }

    let doors = null;
    if (identifier === "door") {
      doors = doorsAndDoorsBG[0];
      doors.push(door);
    } else if (identifier === "doorbg") {
      doors = doorsAndDoorsBG[1];
      doors.push(door);
    }
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

  private getIndexFromWorldLocation(coord: Vec2): number {
    return this.getIndexFromLocation(this.getLocationFromWorldLocation(coord));
  }

  private getIndexFromAnyLocation(coord: Vec2): number {
    return this.getIndexFromLocation(this.getLocationFromAnyLocation(coord));
  }

  private getLocationFromAnyLocation(coord: Vec2): Vec2 {
    let col = Math.floor(coord.x / this.scaleFactor);
    let row = Math.floor(coord.y / this.scaleFactor);
    return new Vec2(col, row);
  }

  public getTilesAboveAnyLocation(location: Vec2, size: Vec2): Vec2[] {
    let tiles: Vec2[] = [];
    let topY = location.y - size.y - 2;
    let leftTile = new Vec2(location.x - size.x / 2, topY);
    let rightTile = new Vec2(location.x + size.x / 2, topY);
    tiles.push(leftTile);
    tiles.push(rightTile);
    return tiles;
  }

  public getTileIndexesAboveAnyLocation(location: Vec2, size: Vec2): number[] {
    let tiles: number[] = [];
    this.getTilesAboveAnyLocation(location, size).forEach((tileCoord) =>
      tiles.push(this.getIndexFromAnyLocation(tileCoord))
    );
    return tiles;
  }

  public getTilesBelowAnyLocation(location: Vec2, size: Vec2): Vec2[] {
    let tiles: Vec2[] = [];
    let bottomY = location.y + size.y + 2;
    let leftTile = new Vec2(location.x - size.x / 2, bottomY);
    let rightTile = new Vec2(location.x + size.x / 2, bottomY);
    tiles.push(leftTile);
    tiles.push(rightTile);
    return tiles;
  }

  public getTileIndexesBelowAnyLocation(location: Vec2, size: Vec2): number[] {
    let tiles: number[] = [];
    this.getTilesBelowAnyLocation(location, size).forEach((tileCoord) =>
      tiles.push(this.getIndexFromAnyLocation(tileCoord))
    );
    return tiles;
  }

  public getTilesLeftAnyLocation(location: Vec2, size: Vec2): Vec2[] {
    let tiles: Vec2[] = [];
    let leftX = location.x - size.x - 2;
    let topTile = new Vec2(leftX, location.y - size.y / 2);
    let bottomTile = new Vec2(leftX, location.y + size.y / 2);
    tiles.push(topTile);
    tiles.push(bottomTile);
    return tiles;
  }

  public getTileIndexesLeftAnyLocation(location: Vec2, size: Vec2): number[] {
    let tiles: number[] = [];
    this.getTilesLeftAnyLocation(location, size).forEach((tileCoord) =>
      tiles.push(this.getIndexFromAnyLocation(tileCoord))
    );
    return tiles;
  }

  public getTilesRightAnyLocation(location: Vec2, size: Vec2): Vec2[] {
    let tiles: Vec2[] = [];
    let rightX = location.x + size.x + 2;
    let topTile = new Vec2(rightX, location.y - size.y / 2);
    let bottomTile = new Vec2(rightX, location.y + size.y / 2);
    tiles.push(topTile);
    tiles.push(bottomTile);
    console.log(topTile);
    return tiles;
  }

  public getTileIndexesRightAnyLocation(location: Vec2, size: Vec2): number[] {
    let tiles: number[] = [];
    this.getTilesRightAnyLocation(location, size).forEach((tileCoord) =>
      tiles.push(this.getIndexFromAnyLocation(tileCoord))
    );
    return tiles;
  }

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
  /*** GENERAL BLOCK MODIFIERS ***/
  public setLayerAtIndexToTile(
    layerName: string,
    index: number,
    tileid: number
  ) {
    let layer = this.getLayerTiles(layerName);
    layer[index] = tileid;
  }

  public setBackgroundAtIndex(index: number, tileid: number) {
    this.setLayerAtIndexToTile(TilemapLayers.BACKGROUND, index, tileid);
  }

  /*** LEVERS ***/
  public toggleLever(nodeid: number, leverid: number): void {
    // Toggle lever
    this.toggleLeverOnly(leverid);

    // Toggle doors
    this.toggleLeverDoorsAndDoorsBG(leverid);
  }

  private toggleLeverOnly(leverid: number): void {
    let leverLayer = this.getLayerTiles(TilemapLayers.LEVERS);
    let leverArea = this.levelLeverAreas[leverid];
    let index = this.getIndexFromWorldLocation(leverArea.position);
    let newLeverID = 0;
    if (leverid % 2 === 0) {
      newLeverID = leverid - 1;
    } else {
      newLeverID = leverid + 1;
    }
    this.levelLeverAreas[newLeverID] = leverArea;
    leverLayer[index] = newLeverID;
    this.levelLeverAreas[leverid] = null;
  }

  private toggleLeverDoorsAndDoorsBG(leverid: number): void {
    let leverDoorLayer = this.getLayerTiles(TilemapLayers.LEVER_DOORS);
    let leverDoorBGLayer = this.getLayerTiles(
      TilemapLayers.LEVER_DOORS_BACKGROUND
    );

    let mapID = leverid;
    if (mapID % 2 === 0) {
      mapID--;
    }
    let lockedDoorID = mapID + 2;
    let unlockedDoorID = mapID + 3;
    let doorsAndDoorsBG = this.leverToDoorsMap.get(mapID);
    let doors = doorsAndDoorsBG[0];
    let doorsBG = doorsAndDoorsBG[1];

    doors.forEach((index) => {
      leverDoorLayer[index] = 0; // unlock door
      leverDoorBGLayer[index] = unlockedDoorID; // set unlocked door
    });
    doorsBG.forEach((index) => {
      leverDoorLayer[index] = lockedDoorID; // lock door
      leverDoorBGLayer[index] = 0; // clear unlocked door
    });

    // update map: swap doors and door bgs
    let tmp = doorsAndDoorsBG[0];
    doorsAndDoorsBG[0] = doorsAndDoorsBG[1];
    doorsAndDoorsBG[1] = tmp;
  }
}
