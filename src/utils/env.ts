import { RuntimeEnv } from '@/types';

let _runtimeEnvCache: RuntimeEnv = RuntimeEnv.Unknown;
export function runtimeEnv(): RuntimeEnv {
  if (_runtimeEnvCache !== RuntimeEnv.Unknown) return _runtimeEnvCache;

  if (typeof window !== 'undefined') {
    _runtimeEnvCache = RuntimeEnv.Browser;
  } else if (typeof process !== 'undefined') {
    _runtimeEnvCache = RuntimeEnv.Node;
  }
  return _runtimeEnvCache;
}

export function loadNodeModule<T>(moduleName: string): T {
  if (runtimeEnv() === RuntimeEnv.Node) {
    return require(moduleName);
  }
  throw new Error('Cannot load node module in a non-node environment');
}
