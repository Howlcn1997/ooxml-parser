export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeEmptyIn<T extends Record<string, any>>(obj: T): T {
  const keys: string[] = Object.keys(obj);
  return keys.reduce((acc, key) => {
    const value = obj[key];
    if (value === null || value === undefined || value === '') return acc;
    (acc as any)[key] = obj[key];
    return acc;
  }, {} as T);
}
