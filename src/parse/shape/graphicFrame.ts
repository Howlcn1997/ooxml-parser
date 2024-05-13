import { XmlNode } from '@/xmlNode';
import { parseXfrm } from '@/parse/attrs';
import { Chart, Diagram, GraphicFrame, Ole, Table } from './type';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<GraphicFrame> {
  console.log('🚀 ~ parse ~ shape:', shape._node);

  const xfrm = await parseXfrm(shape, slide);
  const dimension = { left: xfrm.left, top: xfrm.top, w: xfrm.w, h: xfrm.h };

  const shapeProps = shape.child('nvGraphicFramePr');
  const id = shapeProps!.child('cNvPr')!.attrs.id;

  const graphic = shape.child('graphic');
  const graphicData = graphic!.child('graphicData');
  // switch (graphicData!.attrs.uri) {
  // case 'http://schemas.openxmlformats.org/drawingml/2006/table':
  //   return { id, dimension, type: 'table', ...(await parseTable(graphicData!.child('chart') as XmlNode, slide)) };
  // case 'http://schemas.openxmlformats.org/drawingml/2006/chart':
  //   return { id, dimension, type: 'chart', ...(await parseChart(graphicData!.child('chart') as XmlNode, slide)) };
  // case 'http://schemas.openxmlformats.org/drawingml/2006/diagram':
  //   return { id, dimension, type: 'diagram', ...(await parseDiagram(graphicData!.child('chart') as XmlNode, slide)) };
  // case 'http://schemas.openxmlformats.org/drawingml/2006/ole':
  //   return { id, dimension, type: 'ole', ...(await parseOle(graphicData!.child('chart') as XmlNode, slide)) };
  // default:
  // return { id, dimension, type: 'chart', chatType: 'line' };
  // }
  return { id, dimension, ...(await parseChart(graphicData!.child('chart') as XmlNode, slide)) };
}

async function parseChart(chartNode: XmlNode, slide: SlideBase): Promise<Chart> {
  const rels = await slide.rels();
  const rel = rels[chartNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode._node:', chartXmlNode._node);
  return {
    type: 'chart',
    chatType: 'stock',
  };
}

async function parseTable(tableNode: XmlNode, slide: SlideBase): Promise<Table> {
  return {};
}

async function parseDiagram(diagramNode: XmlNode, slide: SlideBase): Promise<Diagram> {
  return {};
}

async function parseOle(oleNode: XmlNode, slide: SlideBase): Promise<Ole> {
  return {};
}
