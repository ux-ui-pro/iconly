import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import type { ModuleFormat } from 'rollup';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }: { command: 'build' | 'serve' }) => {
  const config: UserConfig = {
    plugins:
      command === 'build'
        ? [
            dts({
              outDir: 'dist',
              insertTypesEntry: true,
              entryRoot: 'src',
              rollupTypes: true,
            }),
          ]
        : [],
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'Iconly',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format: ModuleFormat) =>
          format === 'umd' ? 'index.umd.js' : `index.${format}.js`,
      },
      emptyOutDir: true,
      sourcemap: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          assetFileNames: 'index.[ext]',
        },
      },
    },
  };

  return config;
});
