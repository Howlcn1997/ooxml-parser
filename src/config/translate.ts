const translationMap: Record<string, string> = {
  cx: 'w',
  cy: 'h',
};

export const translate = (key: string) => translationMap[key] || key;
