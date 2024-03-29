import { Fill } from '@/parse/attrs/fill';
import { Element } from '@/parse/shape/type';

export interface Rel {
  type: string;
  target: string;
}
export interface Rels {
  [id: string]: Rel;
}

export type Background = Fill | null;

export interface Slide {
  background: Background;
  elements: Element[];
}

export enum SlideType {
  Slide = 'slide',
  SlideLayout = 'slideLayout',
}