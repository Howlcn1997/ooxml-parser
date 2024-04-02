import { Fill, parseFill } from '@/parse/attrs/fill';
import { Background } from '@/parse/slide/types';
import { XmlNode } from '@/xmlNode';
import SlideBase from './slideBase';
import { parseColor } from '../attrs/color';
/**
 * 背景获取优先级 slide.bg > slideLayout.bg
 */
export default async function parseSlideBackground(slide: SlideBase): Promise<Background> {
  const slideXmlNode = await slide.xmlNode();
  const slideBg = slideXmlNode.child('cSld')?.child('bg');

  const slideBgPr = slideBg?.child('bgPr');
  if (slideBgPr) return await parseFill(slideBgPr as XmlNode, slide);

  // const slideBgRef = slideBg?.child('bgRef');
  // if (slideBgRef) return await parseBgRef(slideBgRef as XmlNode, slide);

  const slideLayout = await slide.layout();
  if (slideLayout) return slideLayout.background();

  const slideMaster = await slide.master();
  if (slideMaster) return slideMaster.background();

  const theme = await slide.theme();
  console.log('theme', theme);
  return { type: 'solid', value: theme.schemeClr['accent1'] };
}

/**
 * doc: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.presentation.backgroundstylereference?view=openxml-3.0.1
 */
export async function parseBgRef(node: XmlNode, slide: SlideBase): Promise<Fill | null> {
  const idx = +node.attrs.idx;
  if (idx === 1000 || idx === 0) return null;

  // if (idx > 1000) {

  // }
  const color = await parseColor(node, slide, { defaultColor: null });
  if (color) return { type: 'solid', value: color };

  return null;
}
