import { XmlNode } from '@/xmlNode';
import { parseXfrm } from '@/parse/attrs';
import { GraphicFrame } from '@/parse/shape/type';
import SlideBase from '@/parse/slide/slideBase';

import { parseTable } from './table';
import { parseChart } from './chart';
import { parseDiagram } from './diagram';
import { parseOle } from './ole';

// 图表的解析暂时滞后，确定渲染器采用何种格式后再进行解析
export default async function parse(shape: XmlNode, slide: SlideBase): Promise<GraphicFrame> {
  const xfrm = await parseXfrm(shape, slide);
  const dimension = { left: xfrm.left, top: xfrm.top, w: xfrm.w, h: xfrm.h };

  const shapeProps = shape.child('nvGraphicFramePr');
  const id = shapeProps!.child('cNvPr')!.attrs.id;

  const graphic = shape.child('graphic');
  const graphicData = graphic!.child('graphicData');
  switch (graphicData!.attrs.uri) {
    case 'http://schemas.openxmlformats.org/drawingml/2006/table':
      return { id, dimension, type: 'table', ...(await parseTable(graphicData!.child('chart') as XmlNode, slide)) };
    case 'http://schemas.openxmlformats.org/drawingml/2006/chart':
      return { id, dimension, type: 'chart', ...(await parseChart(graphicData!.child('chart') as XmlNode, slide)) };
    case 'http://schemas.openxmlformats.org/drawingml/2006/diagram':
      return { id, dimension, type: 'diagram', ...(await parseDiagram(graphicData!.child('chart') as XmlNode, slide)) };
    case 'http://schemas.openxmlformats.org/drawingml/2006/ole':
    default:
      return { id, dimension, type: 'ole', ...(await parseOle(graphicData!.child('chart') as XmlNode, slide)) };
  }
}
