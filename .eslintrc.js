/* eslint-env node */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  plugins: ['@typescript-eslint', 'tailwindcss'],
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      extends: [
        'next/core-web-vitals',
        'plugin:tailwindcss/recommended',
        'prettier',
      ],
    },
  ],
};
