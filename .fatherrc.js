export default {
  cjs: 'rollup', // 构建 CommonJS 格式
  esm: 'rollup', // 构建 ES Module 格式
  cssModules: {
    camelCase: true, // 启用 CSS Modules 的驼峰命名
  },
  // extraBabelPlugins: [
  //   // 添加 Babel 插件
  //   ['@babel/plugin-transform-runtime'],
  // ],
  // extraBabelPresets: [
  //   // 添加 Babel Preset
  //   '@babel/preset-react',
  // ],
  // extraRollupPlugins: [
  //   // 添加 Rollup 插件
  //   require('@rollup/plugin-typescript')(),
  // ],
};