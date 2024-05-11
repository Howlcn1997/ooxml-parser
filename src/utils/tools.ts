/* eslint-disable @typescript-eslint/no-explicit-any */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 删除对象中的空值
 */
export function removeEmptyIn<T extends Record<string, any>>(obj: T): T {
  const keys = Object.keys(obj);
  return keys.reduce((acc, key) => {
    const value = obj[key];
    if (value === null || value === undefined || value === '' || Number.isNaN(value)) return acc;
    (acc as any)[key] = obj[key];
    return acc;
  }, {} as T);
}

// 获取当前XmlNode节点的shape节点
export function getShapeNode(node: any): any {
  if (!node) return null;
  if (node.name === 'sp') return node;
  return getShapeNode(node.parent);
}