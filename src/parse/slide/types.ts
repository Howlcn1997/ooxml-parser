import { Fill } from '@/parse/attrs';
import { Element } from '@/parse/shape/type';

export interface Rel {
  type: string;
  target: string;
}
export interface Rels {
  [id: string]: Rel;
}

export type Background = Fill;

export interface Slide {
  background: Background;
  elements: Element[];
}

export enum SlideType {
  Slide = 'slide',
  SlideLayout = 'slideLayout',
}
