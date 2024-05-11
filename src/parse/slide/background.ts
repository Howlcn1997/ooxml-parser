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
  if (slideBgPr) return (await parseFill(slideBgPr as XmlNode, slide)) as Fill;

  const slideBgRef = slideBg?.child('bgRef');
  if (slideBgRef) return await parseBgRef(slideBgRef as XmlNode, slide);

  const slideLayout = await slide.layout();
  if (slideLayout) return slideLayout.background();

  const slideMaster = await slide.master();
  if (slideMaster) return slideMaster.background();

  const theme = await slide.theme();
  return { type: 'solid', value: theme.schemeClr['accent1'] };
}

/**
 * doc: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.presentation.backgroundstylereference?view=openxml-3.0.1
 *
 * TODO: 完整解析 bgRef
 */
export async function parseBgRef(node: XmlNode, slide: SlideBase): Promise<Fill> {
  const idx = +node.attrs.idx;
  /**
   * fmtScheme 中的phClr为占位符,需要用brReg中的颜色替换
   */
  if (idx > 0 && idx < 1000) {
    // theme.fmtScheme.fillStyleLst[idx - 1]
  }
  if (idx > 1000) {
    // theme.fmtScheme.bgFillStyleLst[idx - 1001]
  }

  const color = await parseColor(node, slide, { defaultColor: undefined });
  if (color) return { type: 'solid', value: color };

  return {
    type: 'solid',
    value: {
      rgba: {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      },
    },
  };
}
