import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import "rollup";

export default {
  input: "src/main.ts",
  plugins: [
    typescript(),
    babel({
      babelrc: false,
      presets: [["@babel/preset-env", { modules: false, loose: true }]],
      plugins: [["@babel/plugin-transform-class-properties", { loose: true }]],
      exclude: "node_modules/**",
    }),
  ],
  output: [
    { file: "dist/oopxml-parser.esm.js", format: "es" },
    { file: "dist/oopxml-parser.cjs.js", format: "cjs" },
    {
      file: "dist/oopxml-parser.umd.js",
      format: "umd",
      name: "oopxmlParser",
    },
  ],
  external: ["jszip"],
  globals: { jszip: "JSZip" },
};
