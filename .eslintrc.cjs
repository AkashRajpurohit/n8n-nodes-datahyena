module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module', extraFileExtensions: ['.json'] },
  overrides: [
    { files: ['credentials/**/*.ts'], plugins: ['eslint-plugin-n8n-nodes-base'], extends: ['plugin:n8n-nodes-base/credentials'] },
    { files: ['nodes/**/*.ts'], plugins: ['eslint-plugin-n8n-nodes-base'], extends: ['plugin:n8n-nodes-base/nodes'] },
  ],
};
