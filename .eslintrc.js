module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb',
    'prettier',
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      'node': {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      'babel-module': {}
    },
    polyfills: ['fetch', 'promises'],
    react: {
      pragma: 'React',
      version: '^16.7.0',
    },
  },
  plugins: [
    'react',
    'jsx-a11y',
    'import',
    'babel',
    'react-hooks',
    'prettier',
    'styled-components-config',
  ],
  rules: {
    semi: ['error', 'never'],
    quotes: ['error', 'single', { avoidEscape: true }],
    camelcase: ['error', { properties: 'never' }],
    curly: 0,
    'func-names': 0,
    'function-paren-newline': 0,
    'object-curly-newline': 0,
    'dot-notation': 0,
    'spaced-comment': 0,
    'global-strict': [0],
    'space-after-keywords': [0],
    'space-return-throw-case': [0],
    'comma-dangle': ['error', 'only-multiline'],
    'prefer-arrow-callback': 0,
    'arrow-parens': 0,
    'arrow-body-style': [0],
    'array-bracket-spacing': 0,
    'no-shadow': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id', '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'],
      },
    ],
    'no-unused-expressions': [
      'error',
      {
        allowTaggedTemplates: true,
      },
    ],
    'no-empty-class': [0],
    'no-empty-label': [0],
    'no-extra-strict': [0],
    'no-space-before-semi': [0],
    'no-wrap-func': [0],
    'no-else-return': [0],
    'no-restricted-syntax': [0],
    'no-use-before-define': [0],
    'no-tabs': 0,
    'no-param-reassign': ['error', { props: false }],
    'no-unused-vars': ['error'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-extra-boolean-cast': 0,
    'no-nested-ternary': 0,
    'import/prefer-default-export': 0,
    'import/no-unresolved': [2, { ignore: ['^@', '^umi/','react-apollo','react-redux','styled-components','js-cookie','redux','react-router-dom'] }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['.storybook/**', 'stories/**', './src/stories/**'],
      },
    ],
    'import/no-named-as-default': 'off',
    'operator-linebreak': [
      'error',
      'after',
      { overrides: { '?': 'ignore', ':': 'ignore' } },
    ],
    'space-before-function-paren': [0],
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: true,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],

    //react
    'react/jsx-indent': [2, 2],
    'react/jsx-indent-props': [2, 2],
    'react/no-unused-prop-types': 0,
    'react/no-unused-state': 'warn',
    'react/jsx-one-expression-per-line': 0,
    'react/no-danger': 0,
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'ignore',
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.js'],
      },
    ],

    //react hook
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    //jsx-a11y
    'jsx-a11y/no-static-element-interactions': [0],
    'jsx-a11y/no-noninteractive-element-interactions': [0],
    'jsx-a11y/click-events-have-key-events': [0],
    'jsx-a11y/anchor-is-valid': [0],
  },
}
