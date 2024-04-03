import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { CustomGeometry, Shape, presetGeometry } from './type';
import SlideBase from '../slide/slideBase';
import { emusToPercentage } from '@/utils/unit';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Shape> {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, slide);

  const shapeProps = shape.child('spPr') as XmlNode;
  const fill = await parseFill(shapeProps, slide);
  const geometry = await extractGeometry(shape, slide);
  return {
    type: 'shape',
    flipH,
    flipV,
    fill,
    geometry,
    dimension: { width, height, left, top },
  };
}

function extractGeometry(shape: XmlNode, slide: SlideBase) {
  const custGeom = (shape.child('spPr') as XmlNode).child('custGeom');

  if (custGeom) {
    console.log(shape._node);
    const pathXmlNodes = custGeom.child('pathLst')?.allChild('path') as XmlNode[];
    const paths = pathXmlNodes.map(pathXmlNode => parsePath(pathXmlNode, slide));
    return { name: 'custom', paths } as CustomGeometry;
  }

  const prstGeom = (shape.child('spPr') as XmlNode).child('prstGeom') as XmlNode;
  // 当前形状名称 rect roundRect...
  const name = prstGeom.attrs.prst;
  const avList = (prstGeom.child('avLst') as XmlNode).children.map((gd: XmlNode) => ({
    name: gd.attrs.name,
    val: emusToPercentage(+gd.attrs.fmla.split(' ')[1]),
  }));
  return { name, avList } as presetGeometry;
}

function parsePath(pathNode: XmlNode, slide: SlideBase) {
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
    width: lHandler(w),
    height: lHandler(h),
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
