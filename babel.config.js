module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
		'nativewind/babel',
  [
    'module-resolver',
    {
      extensions: ['.tsx', '.ts', '.js', '.json'],
      alias: {
        '@components': './src/components',
        '@screens': './src/screens',
        '@assets': './assets',
        '@utils': './src/utils',
        '@styles': './src/styles'
      }
    }
  ]
]
};
};