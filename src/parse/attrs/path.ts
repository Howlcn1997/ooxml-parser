import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { Xfrm } from './types';

/**
 * avLst 转换为SVG path，并将SVG视图大小缩放至shapeXfrm尺寸
 */
export function parsePath(pathNode: XmlNode, slide: SlideBase, shapeXfrm: Xfrm) {
  const children = pathNode.children;
  let { w, h } = pathNode.attrs;
  w = slide.parser.config.lengthHandler(w);
  h = slide.parser.config.lengthHandler(h);

  const rw = +(shapeXfrm.w || w) / +w;
  const rh = +(shapeXfrm.h || h) / +h;

  const xhdl = (emus: string) => slide.parser.config.lengthHandler(+emus * rw);
  const yhdl = (emus: string) => slide.parser.config.lengthHandler(+emus * rh);

  const d = children.reduce((acc, child) => {
    switch (child.name) {
      case 'arcTo':
        return acc + arcTo(child);
      case 'cubicBezTo':
        return acc + cubicBezTo(child);
      case 'lnTo':
        return acc + lnTo(child);
      case 'moveTo':
        return acc + moveTo(child);
      case 'quadBezTo':
        return acc + quadBezTo(child);
      case 'close':
        return acc + close();
      default:
        return acc;
    }
  }, '');

  return d;

  function lnTo(node: XmlNode): string {
    const { x, y } = (node.child('pt') as XmlNode).attrs;

    return `L ${xhdl(x)},${yhdl(y)} `;
  }
  function cubicBezTo(node: XmlNode): string {
    const [pt1, pt2, pt3] = node.allChild('pt') as XmlNode[];
    const { x: x1, y: y1 } = pt1.attrs;
    const { x: x2, y: y2 } = pt2.attrs;
    const { x: x3, y: y3 } = pt3.attrs;

    return `C ${xhdl(x1)},${yhdl(y1)} ${xhdl(x2)},${yhdl(y2)} ${xhdl(x3)},${yhdl(y3)} `;
  }

  function arcTo(node: XmlNode) {
    const { wR, hR, stAng, swAng } = node.attrs;
    const { x, y } = (node.child('pt') as XmlNode).attrs;

    return `A ${xhdl(wR)},${yhdl(hR)} ${xhdl(stAng)} ${yhdl(swAng)} ${xhdl(x)},${yhdl(y)} `;
  }

  function quadBezTo(node: XmlNode) {
    const [pt1, pt2] = node.allChild('pt') as XmlNode[];
    const { x: x1, y: y1 } = pt1.attrs;
    const { x: x2, y: y2 } = pt2.attrs;

    return `Q ${xhdl(x1)},${yhdl(y1)} ${xhdl(x2)},${yhdl(y2)} `;
  }

  function moveTo(node: XmlNode) {
    const { x, y } = (node.child('pt') as XmlNode).attrs;

    return `M ${xhdl(x)},${yhdl(y)} `;
  }

  function close() {
    return 'Z ';
  }
}
