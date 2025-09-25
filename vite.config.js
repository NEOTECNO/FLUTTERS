import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        // This tells Rollup to not bundle this module
        // and to treat it as an external dependency.
        '@noble/curves/secp256k1',
      ],
    },
  },
});