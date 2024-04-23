import { XmlNode } from '@/xmlNode';
import { Effect } from './types';
import SlideBase from '../slide/slideBase';
import { parseColor } from './color';
import { angleToDegrees, emusToPercentage } from '@/utils/unit';

export async function parseEffect(effectLst: XmlNode | null, slide: SlideBase): Promise<Effect | null> {
  if (!effectLst) return null;

  const effect: Record<string, any> = {};

  const children = effectLst.children;
  if (children.length === 0) return null;

  for (const child of children) {
    console.log('effect', child._node);
    switch (child.name) {
      case 'prstShdw':
        effect.shadow = await presetShadow(child, slide);
      case 'innerShdw':
        effect.shadow = await innerShadow(child, slide);
      case 'outerShdw':
        effect.shadow = await outerShadow(child, slide);
        break;
      case 'reflection':
      case 'glow':
      case 'softEdge':
      case 'blur':
    }
  }
  return effect;
}

async function presetShadow(node: XmlNode, slide: SlideBase): Promise<Effect['shadow']> {
  console.log('presetShadow', node._node);
}

async function innerShadow(node: XmlNode, slide: SlideBase): Promise<Effect['shadow']> {
  return {
    type: 'inner',
    ...(await shadow(node, slide)),
  };
}

async function outerShadow(node: XmlNode, slide: SlideBase): Promise<Effect['shadow']> {
  return {
    type: 'outer',
    ...(await shadow(node, slide)),
  };
}

async function shadow(node: XmlNode, slide: SlideBase): Promise<Effect['shadow']> {
  const { blurRad = '0', dist = '0', dir = '0', sx = '100000' } = node.attrs;
  return {
    // 模糊度
    blurRad: slide.parser.config.lengthHandler(+blurRad),
    // 模糊距离
    dist: slide.parser.config.lengthHandler(+dist),
    // 模糊角度
    dir: angleToDegrees(+dir),
    // 阴影大小缩放  实际上应该有sx、sy两个属性，但阴影一般都为等比例缩放,此处做简化实现故仅使用sx来作为缩放大小
    scale: emusToPercentage(+sx),
    color: await parseColor(node, slide),
  };
}
