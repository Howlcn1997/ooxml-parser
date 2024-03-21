import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import 'rollup';

export default {
  input: 'src/index.ts',
  plugins: [
    typescript(),
    babel({
      babelrc: false,
      presets: [['@babel/preset-env', { modules: false, loose: true }]],
      plugins: [['@babel/plugin-transform-class-properties', { loose: true }]],
      exclude: 'node_modules/**',
    }),
  ],
  output: [
    { file: 'dist/ooxml-parser.esm.js', format: 'es' },
    { file: 'dist/ooxml-parser.cjs.js', format: 'cjs' },
    { file: 'dist/ooxml-parser.umd.js', format: 'umd', name: 'OOXMLParser', globals: { jszip: 'JSZip' } },
  ],
  external: ['jszip'],
};
