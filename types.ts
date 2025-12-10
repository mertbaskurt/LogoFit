export interface Dimensions {
  width: number;
  height: number;
}

export interface ImageState {
  file: File | null;
  element: HTMLImageElement | null;
  name: string;
}

export const DEFAULT_DIMENSIONS: Dimensions = {
  width: 287,
  height: 380,
};