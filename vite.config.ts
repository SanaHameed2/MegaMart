// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/')
          ) {
            return 'react-vendor';
          }

          // Apollo + GraphQL
          if (
            id.includes('node_modules/@apollo/') ||
            id.includes('node_modules/graphql/')
          ) {
            return 'apollo-vendor';
          }

          // Supabase
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase-vendor';
          }

          // Zustand
          if (id.includes('node_modules/zustand/')) {
            return 'state-vendor';
          }

          // Lucide icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'ui-vendor';
          }

          // Everything else in node_modules → vendor
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});