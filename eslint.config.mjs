import next from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...next,
  ...nextTypescript,
  {
    ignores: ['.next/**', '.vercel/**', 'node_modules/**'],
  },
]

export default eslintConfig
