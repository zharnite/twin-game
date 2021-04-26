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
    this.parseInteractables();
  }

  private parseInteractables(): void {
    let layers = this.tilemap.layers;
    let interactables = layers.filter(
      (layer) => layer.name === TilemapLayers.INTERACTABLE
    )[0];
    let tiles = interactables.data;

    // Parse each relevant tile
    for (let i = 0; i < tiles.length; i++) {
      // Entrance tiles
      if (tiles[i] === Terrains.BODY_ENTRANCE) {
        console.log(this.getLocationFromIndex(i).scale(this.scaleFactor));
      }
    }
  }

  private getLocationFromIndex(index: number): Vec2 {
    let n = this.tilemap.width;
    let row = Math.floor(index / n);
    let col = index % n;

    return new Vec2(col, row);
  }
}
