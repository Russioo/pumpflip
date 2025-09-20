import next from 'eslint-config-next';

export default [
  ...next,
  {
    rules: {
      'react/jsx-key': 'error'
    }
  }
];


