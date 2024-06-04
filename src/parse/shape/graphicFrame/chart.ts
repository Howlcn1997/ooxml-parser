import SlideBase from '@/parse/slide/slideBase';
import { XmlNode } from '@/xmlNode';
import { BarChart, Chart, ChartData, PieChart } from '@/parse/shape/type';
import { TextBody, parseRichTx } from '@/parse/attrs';

export async function parseChart(chartShapeNode: XmlNode, slide: SlideBase): Promise<Chart> {
  const rels = await slide.rels();
  const rel = rels[chartShapeNode.attribute('r:id')];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  const chart = chartXmlNode.child('chart') as XmlNode;
  const plotArea = chart.child('plotArea') as XmlNode;

  switch (true) {
    case !!plotArea.child('barChart'):
      return { chartType: 'bar', ...(await parseBarChart(chart, slide)) };
    case !!plotArea.child('pieChart'):
      return { chartType: 'pie', ...(await parsePieChart(chart, slide)) };
  }

  return { chartType: 'line' };
}

async function parseBarChart(chart: XmlNode, slide: SlideBase): Promise<BarChart> {
  const richNode = chart.deepChild(['title', 'tx', 'rich']);
  const title = richNode && ((await parseRichTx(richNode, slide)) as TextBody);

  const barChartNode = chart.deepChild(['plotArea', 'barChart']) as XmlNode;
  const grouping = barChartNode.child('grouping')!.attribute('val') as string;
  const data = await extractChartData(barChartNode);

  const valuesAxis = chart.deepChild(['plotArea', 'valAx', 'title', 'tx', 'rich']);
  const categoryAxis = chart.deepChild(['plotArea', 'catAx', 'title', 'tx', 'rich']);

  return {
    title,
    data,
    grouping,
    valAx: valuesAxis && (await parseRichTx(valuesAxis, slide)),
    catAx: categoryAxis && (await parseRichTx(categoryAxis, slide)),
  };
}

async function parsePieChart(chart: XmlNode, slide: SlideBase): Promise<PieChart> {
  const richNode = chart.deepChild(['title', 'tx', 'rich']);
  const title = richNode && ((await parseRichTx(richNode, slide)) as TextBody);

  const pieChartNode = chart.deepChild(['plotArea', 'pieChart']) as XmlNode;
  const data = await extractChartData(pieChartNode);
  return { title, data };
}

async function extractChartData(chartNode: XmlNode): Promise<ChartData> {
  const seriesNodes = chartNode.allChild('ser') as XmlNode[];

  return seriesNodes.map(seriesNode => {
    const index = seriesNode.child('idx')?.attribute('val');

    const colName = seriesNode.deepChild(['tx', 'strRef', 'strCache', 'pt', 'v'])!.text;
    const rowName = seriesNode
      .deepChild(['cat', 'strRef', 'strCache'])!
      .childWith('pt', node => node.attribute('idx') === index)!
      .child('v')!.text;

    const numCache = seriesNode.deepChild(['val', 'numRef', 'numCache']) as XmlNode;
    const ptNodes = numCache.allChild('pt') as XmlNode[];
    
    const valuesCount = +numCache.child('ptCount')!.attribute('val') as number;

    const values = ptNodes.reduce((acc, ptNode) => {
      acc[ptNode.attribute('idx')] = ptNode.child('v')!.text;
      return acc;
    }, {} as Record<number, string>);

    return { colName, values: [{ rowName, values: Array.from({ length: valuesCount }, (_, i) => values[i]) }] };
  });
}