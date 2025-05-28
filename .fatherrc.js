// import copy from 'rollup-plugin-copy';

export default {

  cjs: 'rollup', // 构建 CommonJS 格式
  esm: 'rollup', // 构建 ES Module 格式
  cssModules: {
    camelCase: true, // 启用 CSS Modules 的驼峰命名
  },
  extraRollupPlugins: [
    // copy({
    //   targets: [
    //     { src: 'public/**/*', dest: 'dist/public' },
    //     { src: 'public/docs/*.md', dest: 'dist/docs' }
    //   ],
    //   hook: 'writeBundle' // 在打包完成后执行
    // }),
    require('@rollup/plugin-commonjs')({
      include: /node_modules\/react-dom/,
      requireReturnsDefault: 'auto' // 强制识别默认导出
    }),
    // require('@rollup/plugin-node-resolve')({
    //   browser: true,
    //   extensions: ['.js', '.jsx', '.ts', '.tsx']
    // })
  ]

};