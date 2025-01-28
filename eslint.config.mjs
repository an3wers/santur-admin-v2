// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt(
  {
    plugins: {
      prettier: prettierPlugin
    }
  },
  {
    files: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.vue'],
    ignores: ['node_modules', '.nuxt', '.husky', '.config/*']
  },
  {
    rules: {
      // @ts-ignore
      ...prettierPlugin.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'eslint-disable-next-line': 'off',
      'vue/attributes-order': 'off',
      'dot-notation': 'off',
      'no-var': 'warn',
      'import/no-named-as-default': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-dynamic-delete': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      'prettier/prettier': [
        'warn',
        {
          semi: false,
          singleQuote: true,
          arrowParens: 'always',
          trailingComma: 'none',
          endOfLine: 'auto',
          tabWidth: 2,
          printWidth: 100
        }
      ]
    }
  }
)
