export enum Orientation {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL'
}

export interface ZoetropeSettings {
  frameCount: number;
  fps: number;
  orientation: Orientation;
  numStrips: number; // New property: How many parallel strips are in the image
}

export interface ImageState {
  src: string;
  width: number;
  height: number;
}