import { lengthPt, fontSizePt } from './config/pt';

interface PtFactor {
  lengthFactor: number;
  fontsizeFactor: number;
}

export function pt2px(pt: string, ptFactor: PtFactor, unitName?: string) {
  // 若传递了单位名称，则判断当前单位是否需要转换
  if (unitName) {
    if (lengthPt.has(unitName)) return +pt * ptFactor.lengthFactor;
    if (fontSizePt.has(unitName)) return +pt * ptFactor.fontsizeFactor;
    // console.warn(`Unknown pt2px unit: ${unitName} pt: ${pt}`);
    return pt;
  }
  return +pt * ptFactor.lengthFactor;
}
