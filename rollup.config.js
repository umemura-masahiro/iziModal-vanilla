import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

export default [
  // ESM版（非圧縮）- 開発用
  {
    input: 'src/index.js',
    output: {
      file: 'dist/iziModal.esm.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { esmodules: true },
              modules: false,
            },
          ],
        ],
      }),
    ],
  },
  // ESM版（圧縮）- 本番用
  {
    input: 'src/index.js',
    output: {
      file: 'dist/iziModal.esm.min.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { esmodules: true },
              modules: false,
            },
          ],
        ],
      }),
      terser({
        compress: {
          drop_console: false,
          passes: 2,
        },
        mangle: {
          properties: false,
        },
      }),
    ],
  },
];
