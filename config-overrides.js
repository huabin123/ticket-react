const { override, fixBabelImports, addLessLoader, addDecoratorsLegacy } = require('customize-cra');

const rewiredMap = () => config => {
  config.devtool = false
  return config
}

module.exports = override(

  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    // modifyVars: { "@primary-color": "#f47983"}
  }),

  addDecoratorsLegacy(),
  rewiredMap()
);