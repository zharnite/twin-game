import {
  TiledLayerData,
  TiledTilemapData,
} from "../../../../../Wolfie2D/DataTypes/Tilesets/TiledData";
import Vec2 from "../../../../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "../GameLevel";
import { Terrains } from "./Enums/TerrainEnums";
import { TilemapLayers } from "./Enums/TilemapLayerEnums";

export default class TerrainManager {
  private level: GameLevel;
  private tilemapName: string;
  private tilemap: TiledTilemapData;
  private scaleFactor: number;

  constructor(level: GameLevel, tilemapName: string) {
    this.level = level;
    this.tilemapName = tilemapName;
    this.tilemap = this.level.load.getTilemap(this.tilemapName);
    this.scaleFactor = this.tilemap.tilewidth * 2;
    this.parseTilemap();

    console.log(this.tilemap);
  }

  private parseTilemap(): void {
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
        bodyExitLocation = this.getLocationFromIndex(i).scale(this.scaleFactor);
      } else if (tiles[i] === Terrains.SOUL_ENTRANCE) {
        soulEntranceLocation = this.getLocationFromIndex(i);
      } else if (tiles[i] === Terrains.SOUL_EXIT) {
        soulExitLocation = this.getLocationFromIndex(i).scale(this.scaleFactor);
      }
    }

    // Initialize level entrances
    this.setEntrances(bodyEntranceLocation, soulEntranceLocation);

    // Initialize level exits
  }

  private setEntrances(
    bodyEntranceLocation: Vec2,
    soulEntranceLocation: Vec2
  ): void {
    // Modify entrance location to be centered
    bodyEntranceLocation.x += 0.5;
    soulEntranceLocation.x += 0.5;

    // Scale entrance location
    bodyEntranceLocation.scale(this.scaleFactor);
    soulEntranceLocation.scale(this.scaleFactor);

    // Set spawn locations
    this.level.setPlayerSpawn(bodyEntranceLocation);
    this.level.setGhostPlayerSpawn(soulEntranceLocation);
  }

  private getLayerTiles(name: string): number[] {
    let layers = this.tilemap.layers;
    let tiles = layers.filter((layer) => layer.name === name)[0].data;
    return tiles;
  }

  private getLocationFromIndex(index: number): Vec2 {
    let n = this.tilemap.width;
    let row = Math.floor(index / n);
    let col = index % n;
    return new Vec2(col, row);
  }
}
