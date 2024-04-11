export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeEmptyIn(obj: Record<string, any>) {
  const keys = Object.keys(obj);
  return keys.reduce((acc, key) => {
    const value = obj[key];
    if (value === null || value === undefined || value === '') return acc;
    acc[key] = obj[key];
    return acc;
  }, {} as Record<string, any>);
}
