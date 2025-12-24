export enum Orientation {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL'
}

export interface ZoetropeSettings {
  frameCount: number;
  fps: number;
  orientation: Orientation;
}

export interface ImageState {
  src: string;
  width: number;
  height: number;
}