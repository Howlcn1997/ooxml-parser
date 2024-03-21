const translationMap: Record<string, string> = {
  cx: 'width',
  cy: 'height',
};

export const translate = (key: string) => translationMap[key] || key;
