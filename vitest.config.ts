import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

interface TsconfigWithPaths {
    compilerOptions: { paths: Record<string, string[]> };
}

const tsconfig: TsconfigWithPaths = JSON.parse(
    readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf8'),
);

// tsconfig.json is the only place aliases are declared; Vitest does not read `paths` by itself.
const tsconfigAliases = Object.entries(tsconfig.compilerOptions.paths).map(([alias, [target]]) => ({
    find: alias.replace(/\/\*$/, ''),
    replacement: path.resolve(__dirname, target.replace(/\/\*$/, '')),
}));

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./test-setup.ts'],
        globals: true,
        include: ['**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'test-setup.ts',
                '**/*.config.*',
            ],
        },
    },
    resolve: {
        alias: [
            // Next resolves `server-only` through the react-server export condition, which the test runner lacks.
            { find: 'server-only', replacement: path.resolve(__dirname, 'node_modules/server-only/empty.js') },
            ...tsconfigAliases,
        ],
    },
});
