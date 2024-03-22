type ColorType = 'srgb' | 'sysClr' | 'unknown';

export interface Color {
  type: ColorType;
  value: string;
}
