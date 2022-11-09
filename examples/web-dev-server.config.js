export default {
  concurrency: 10,
  nodeResolve: true,
  watch: true,
  // in a monorepo you need to set set the root dir to resolve modules
  rootDir: '.',
  appIndex: 'src/web/index.html?graph=HelloWorld',
};
