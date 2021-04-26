import {
  TiledLayerData,
  TiledTilemapData,
} from "../../../../../Wolfie2D/DataTypes/Tilesets/TiledData";
import Vec2 from "../../../../../Wolfie2D/DataTypes/Vec2";
import { PlayerTypes } from "../../../Enums/PlayerEnums";
import GameLevel from "../GameLevel";
import { Terrains } from "./Enums/TerrainEnums";
import { TilemapLayers } from "./Enums/TilemapLayerEnums";

export default class TerrainManager {
  private level: GameLevel;
  private tilemapName: string;
  private tilemap: TiledTilemapData;
  private scaleFactor: number;

  static singleBlockSize: Vec2 = new Vec2(1, 1);

  constructor(level: GameLevel, tilemapName: string) {
    this.level = level;
    this.tilemapName = tilemapName;
    this.tilemap = this.level.load.getTilemap(this.tilemapName);
    this.scaleFactor = this.tilemap.tilewidth * 2;

    console.log(this.tilemap);
  }

  /**
   * Parses all tiles and sets up properties of the tiles
   * List of servies provided:
   *  - Sets up doors: spawn location, exit location, level progression
   */
  public parseTilemap(): void {
    this.parseDoors();
  }

  private parseDoors(): void {
    let tiles = this.getLayerTiles(TilemapLayers.DOORS);
    let bodyEntranceLocation = null;
    let bodyExitLocation = null;
    let soulEntranceLocation = null;
    let soulExitLocation = null;

    // Parse each relevant tile
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === Terrains.BODY_ENTRANCE) {
        bodyEntranceLocation = this.getLocationFromIndex(i);
      } else if (tiles[i] === Terrains.BODY_EXIT) {
        bodyExitLocation = this.getLocationFromIndex(i);
      } else if (tiles[i] === Terrains.SOUL_ENTRANCE) {
        soulEntranceLocation = this.getLocationFromIndex(i);
      } else if (tiles[i] === Terrains.SOUL_EXIT) {
        soulExitLocation = this.getLocationFromIndex(i);
      }
    }

    // Initialize spawn locations
    this.setSpawnLocations(bodyEntranceLocation, soulEntranceLocation);

    // Initialize level exits
    this.setExitLocations(bodyExitLocation, soulExitLocation);
  }

  private setSpawnLocations(
    bodyEntranceLocation: Vec2,
    soulEntranceLocation: Vec2
  ): void {
    // Modify entrance location to be centered for the player's spawn point
    let bodySpawn = new Vec2(
      bodyEntranceLocation.x + 0.5,
      bodyEntranceLocation.y
    );
    let soulSpawn = new Vec2(
      soulEntranceLocation.x + 0.5,
      soulEntranceLocation.y
    );

    // Scale the spawn locations to the game size
    bodySpawn.scale(this.scaleFactor);
    soulSpawn.scale(this.scaleFactor);

    // Set spawn locations
    this.level.setPlayerSpawn(bodySpawn, true);
    this.level.setGhostPlayerSpawn(soulSpawn, true);
  }

  private setExitLocations(
    bodyExitLocation: Vec2,
    soulExitLocation: Vec2
  ): void {
    // Modify exit location to be centered
    bodyExitLocation
      .add(TerrainManager.singleBlockSize.scaled(0.5))
      .scale(this.scaleFactor);
    soulExitLocation
      .add(TerrainManager.singleBlockSize.scaled(0.5))
      .scale(this.scaleFactor);

    // Add the exit locations
    this.level.addExit(
      bodyExitLocation,
      TerrainManager.singleBlockSize.scaled(this.scaleFactor),
      PlayerTypes.PLAYER
    );
    this.level.addExit(
      soulExitLocation,
      TerrainManager.singleBlockSize.scaled(this.scaleFactor),
      PlayerTypes.GHOST_PLAYER
    );
  }

  /**
   * Gets all tiles for a layer
   * @param name The layer's name (Main, Background, Doors)
   * @returns Array of tile ids for the given layer name
   */
  private getLayerTiles(name: string): number[] {
    let layers = this.tilemap.layers;
    let tiles = layers.filter((layer) => layer.name === name)[0].data;
    return tiles;
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
}
