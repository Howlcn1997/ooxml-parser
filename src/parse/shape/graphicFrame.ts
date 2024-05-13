import { XmlNode } from '@/xmlNode';
import { parseXfrm } from '@/parse/attrs';
import { GraphicFrame } from './type';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<GraphicFrame> {
  console.log('🚀 ~ parse ~ shape:', shape._node);

  const xfrm = await parseXfrm(shape, slide);
  const dimension = { left: xfrm.left, top: xfrm.top, w: xfrm.w, h: xfrm.h };

  const shapeProps = shape.child('nvGraphicFramePr') as XmlNode;
  const id = (shapeProps.child('cNvPr') as XmlNode).attrs.id;

  const graphic = shape.child('graphic') as XmlNode;
  const graphicData = graphic.child('graphicData') as XmlNode;
  const { uri } = graphicData.attrs;
  switch (uri) {
    case 'http://schemas.openxmlformats.org/drawingml/2006/table':
    case 'http://schemas.openxmlformats.org/drawingml/2006/chart':
      return { id, dimension, type: 'chart', ...(await parseChart(graphicData.child('chart') as XmlNode, slide)) };
    case 'http://schemas.openxmlformats.org/drawingml/2006/diagram':
    case 'http://schemas.openxmlformats.org/drawingml/2006/ole':
      break;
  }
  return { id, dimension, type: 'chart', ...(await parseChart(graphicData.child('chart') as XmlNode, slide)) };
}

async function parseChart(chartNode: XmlNode, slide: SlideBase) {
  const rels = await slide.rels();
  const rel = rels[chartNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log(chartXmlNode._node);
  return {};
}
