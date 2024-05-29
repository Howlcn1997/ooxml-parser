import { XmlNode } from '@/xmlNode';
import { TextBody, parseTxBody, parseXfrm } from '@/parse/attrs';
import { BarChart, Chart, Diagram, GraphicFrame, Ole, Table } from './type';
import SlideBase from '../slide/slideBase';

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

async function parseChart(chartNode: XmlNode, slide: SlideBase): Promise<Chart> {
  const rels = await slide.rels();
  const rel = rels[chartNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode:', chartXmlNode._node);
  const plotArea = chartXmlNode.child('chart')!.child('plotArea') as XmlNode;

  switch (true) {
    case !plotArea.child('barChart'):
      return { chartType: 'bar', ...(await parseBarChart(chartXmlNode, slide)) };
  }

  return { chartType: 'line' };
}

async function parseBarChart(chartXmlNode: XmlNode, slide: SlideBase): Promise<BarChart> {
  const chartNode = chartXmlNode.child('chart') as XmlNode;
  // 图表标题
  const title = (await parseTxBody(chartNode.child('title')!.child('tx')!.child('rich'), slide)) as TextBody;
  const grouping = chartNode.child('plotArea')!.child('barChart')!.child('grouping')!.attrs.val;

  const barChartNode = chartNode.child('plotArea')!.child('barChart') as XmlNode;

  const seriesNodes = barChartNode.allChild('ser') as XmlNode[];
  const data = parseChartData(barChartNode, slide);
  /**
   * [
   *  series
   *  {
   *   name: 'A',
   *   data: [1, 2, 3, 4, 5]}
   * ]
   */
  return { title, grouping, data: [] };
}

async function parseChartData(plotChartNode: XmlNode, slide: SlideBase): ChartData {
  const barChartNode = plotChartNode.child('barChart') as XmlNode;
  const grouping = barChartNode.child('grouping')!.attrs.val;
  const seriesNodes = barChartNode.allChild('ser') as XmlNode[];
  const data = seriesNodes.map(seriesNode => {
    const colName = seriesNode.child('tx')!.child('strRef')!.child('strCache')!.child('pt')!.child('v')!.text;

  });
  return [
    {
      colName: '',
      values: [
        {
          rowName: '',
          values: [1, 2, 3, 4, 5],
        },
      ],
    },
  ];
}

async function parseTable(tableNode: XmlNode, slide: SlideBase): Promise<Table> {
  const rels = await slide.rels();
  const rel = rels[tableNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode._node:', chartXmlNode);
  return {};
}

async function parseDiagram(diagramNode: XmlNode, slide: SlideBase): Promise<Diagram> {
  const rels = await slide.rels();
  const rel = rels[diagramNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode._node:', chartXmlNode);
  return {};
}

async function parseOle(oleNode: XmlNode, slide: SlideBase): Promise<Ole> {
  const rels = await slide.rels();
  const rel = rels[oleNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode._node:', chartXmlNode);
  return {};
}
