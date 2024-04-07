import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';

export default function parsePath(pathNode: XmlNode, slide: SlideBase) {
  const children = pathNode.children;
  const { w, h } = pathNode.attrs;

  const lHandler = (emus: string) => slide.parser.config.lengthHandler(+emus);

  const d = children.reduce((acc, child) => {
    switch (child.name) {
      case 'arcTo':
        return acc + arcTo(child, lHandler);
      case 'cubicBezTo':
        return acc + cubicBezTo(child, lHandler);
      case 'lnTo':
        return acc + lnTo(child, lHandler);
      case 'moveTo':
        return acc + moveTo(child, lHandler);
      case 'quadBezTo':
        return acc + quadBezTo(child, lHandler);
      case 'close':
        return acc + close();
      default:
        return acc;
    }
  }, '');

  return {
    w: lHandler(w),
    h: lHandler(h),
    d,
  };

  function lnTo(node: XmlNode, lh: typeof lHandler): string {
    const { x, y } = (node.child('pt') as XmlNode).attrs;

    return `L ${lh(x)},${lh(y)} `;
  }
  function cubicBezTo(node: XmlNode, lh: typeof lHandler): string {
    const [pt1, pt2, pt3] = node.allChild('pt') as XmlNode[];
    const { x: x1, y: y1 } = pt1.attrs;
    const { x: x2, y: y2 } = pt2.attrs;
    const { x: x3, y: y3 } = pt3.attrs;

    return `C ${lh(x1)},${lh(y1)} ${lh(x2)},${lh(y2)} ${lh(x3)},${lh(y3)} `;
  }

  function arcTo(node: XmlNode, lh: typeof lHandler) {
    const { wR, hR, stAng, swAng } = node.attrs;
    const { x, y } = (node.child('pt') as XmlNode).attrs;

    return `A ${lh(wR)},${lh(hR)} ${lh(stAng)} ${lh(swAng)} ${lh(x)},${lh(y)} `;
  }

  function quadBezTo(node: XmlNode, lh: typeof lHandler) {
    const [pt1, pt2] = node.allChild('pt') as XmlNode[];
    const { x: x1, y: y1 } = pt1.attrs;
    const { x: x2, y: y2 } = pt2.attrs;

    return `Q ${lh(x1)},${lh(y1)} ${lh(x2)},${lh(y2)} `;
  }

  function moveTo(node: XmlNode, lh: typeof lHandler) {
    const { x, y } = (node.child('pt') as XmlNode).attrs;

    return `M ${lh(x)},${lh(y)} `;
  }

  function close() {
    return 'Z ';
  }
}
