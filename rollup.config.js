import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  // ESM版（非圧縮）- 開発用
  {
    input: 'src/index.js',
    output: {
      file: 'dist/iziModal.esm.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [nodeResolve()],
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
