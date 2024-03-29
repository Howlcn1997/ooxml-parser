const __pending: Record<string, any> = {};

export function promiseMergerInner(cacheKey: string) {

  const promiseInstance = new Promise((resolve, reject) => {
    if (__pending[cacheKey]) __pending[cacheKey].push({ resolve, reject });
    else __pending[cacheKey] = [{ resolve, reject }];
  });

  return {
    resolve: <T>(value: T) => finish<T>(value, 'resolve'),
    reject: <T>(value: T) => finish<T>(value, 'reject'),
    promise,
    exist,
  };

  function exist() {
    return __pending[cacheKey] && __pending[cacheKey].length > 1;
  }

  function finish<T>(value: T, type: 'reject' | 'resolve'): Promise<T> {
    const pendingQueue = __pending[cacheKey];
    if (pendingQueue) {
      pendingQueue.forEach((i: any) => i[type](value));
    }
    delete __pending[cacheKey];
    if (type === 'resolve') return Promise.resolve(value);
    return Promise.reject(value);
  }

  function promise(): Promise<any> {
    return promiseInstance;
  }
}
