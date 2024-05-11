/* eslint-disable @typescript-eslint/no-explicit-any */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeEmptyIn<T extends Record<string, any>>(obj: T): T {
  const keys = Object.keys(obj);
  return keys.reduce((acc, key) => {
    const value = obj[key];
    if (value === null || value === undefined || value === '' || Number.isNaN(value)) return acc;
    (acc as any)[key] = obj[key];
    return acc;
  }, {} as T);
}
