import { Fill } from '@/parse/attrs/fill';
import { Element } from '@/parse/shape/type';

export interface Slide {}

export enum RelType {
  SlideLayout = 'slideLayout',
  Image = 'image',
}

export interface Rel {
  type: RelType;
  target: string;
}

export type Background = Fill | null;

export interface Slide {
  background: Background;
  elements: Element[];
  rels: Rel[];
}

export enum SlideType {
  Slide = 'slide',
  SlideLayout = 'slideLayout',
}
