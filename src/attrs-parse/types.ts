type ColorType = 'srgb' | 'sys' | 'scheme' | 'unknown';

export interface Color {
  type: ColorType;
  value: string;
}
