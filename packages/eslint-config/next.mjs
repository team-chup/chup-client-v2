import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

import { baseConfig } from './base.mjs';

export const nextConfig = defineConfig([...nextVitals, ...nextTs, prettierConfig, ...baseConfig]);
