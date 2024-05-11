import { XmlNode } from '@/xmlNode';
import {} from './types';
import SlideBase from '../slide/slideBase';
import { ShapeEffect, TextEffect, Effect, Glow, Reflection, Shadow, ShadowType, SoftEdge, parseColor } from '@/parse/attrs';
import { angleToDegrees, emusToPercentage } from '@/utils/unit';
import { removeEmptyIn } from '@/utils/tools';

export async function parseTextEffect(effectLst: XmlNode | undefined, slide: SlideBase): Promise<TextEffect | undefined> {
  return await parseEffect(effectLst, slide);
}

export async function parseShapeEffect(effectLst: XmlNode | undefined, slide: SlideBase): Promise<ShapeEffect | undefined> {
  return await parseEffect(effectLst, slide);
}

async function parseEffect(effectLst: XmlNode | undefined, slide: SlideBase): Promise<Effect | undefined> {
  if (!effectLst) return;

  const effect: Record<string, any> = {};

  const children = effectLst.children;
  if (children.length === 0) return;

  for (const child of children) {
    switch (child.name) {
      case 'prstShdw':
        effect.shadow = await presetShadow(child, slide);
        break;
      case 'innerShdw':
        effect.shadow = await innerShadow(child, slide);
        break;
      case 'outerShdw':
        effect.shadow = await outerShadow(child, slide);
        break;
      case 'reflection':
        effect.reflection = await reflection(child, slide);
        break;
      case 'glow':
        effect.glow = await glow(child, slide);
        break;
      case 'softEdge':
        effect.softEdge = softEdge(child, slide);
        break;
    }
  }
  return effect;
}

async function presetShadow(node: XmlNode, slide: SlideBase): Promise<Shadow> {
  return { type: ShadowType.Preset, ...(await shadow(node, slide)) };
}

async function innerShadow(node: XmlNode, slide: SlideBase): Promise<Shadow> {
  return { type: ShadowType.Inner, ...(await shadow(node, slide)) };
}

async function outerShadow(node: XmlNode, slide: SlideBase): Promise<Shadow> {
  return { type: ShadowType.Outer, ...(await shadow(node, slide)) };
}

async function shadow(node: XmlNode, slide: SlideBase): Promise<Omit<Shadow, 'type'>> {
  const { blurRad = '0', dist = '0', dir = '0', sx, sy } = node.attrs;
  return {
    blurRad: slide.parser.config.lengthHandler(+blurRad),
    dist: slide.parser.config.lengthHandler(+dist),
    dir: angleToDegrees(+dir),
    // 实际上应该有sx、sy两个属性，但阴影一般都为等比例缩放,此处做简化实现故仅使用sx来作为缩放大小
    scale: emusToPercentage(+(sx || sy || '100000')),
    color: await parseColor(node, slide),
  };
}

async function reflection(node: XmlNode, slide: SlideBase): Promise<Reflection> {
  const { algn, dist, dir, blurRad, sx, sy, stA, endA, stPos, endPos, rotWithShape } = node.attrs;
  return removeEmptyIn<Reflection>({
    align: algn,
    blurRad: slide.parser.config.lengthHandler(+blurRad),
    dir: angleToDegrees(+dir || 0),
    dist: slide.parser.config.lengthHandler(+dist),
    startAlpha: emusToPercentage(+stA),
    endAlpha: emusToPercentage(+endA),
    scale: emusToPercentage(+(sx || sy || '100000')),
    startPos: emusToPercentage(+stPos),
    endPos: emusToPercentage(+endPos),
    rotWithShape: rotWithShape === '1',
  });
}

async function glow(node: XmlNode, slide: SlideBase): Promise<Glow> {
  return {
    radius: slide.parser.config.lengthHandler(+node.attrs.rad),
    color: await parseColor(node, slide),
  };
}

function softEdge(node: XmlNode, slide: SlideBase): SoftEdge {
  return { radius: slide.parser.config.lengthHandler(+node.attrs.rad) };
}
