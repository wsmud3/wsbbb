// pm2 进程定义。
//
// 路径一律从本文件位置（__dirname）推导，不要写死绝对路径：
//   - 部署目录未必是 /home/mud/mud（隔离改造后测试服用独立目录）
//   - pm2 用相对路径时以「调用 pm2 时的 cwd」为基准，换目录执行会写错日志位置
//   - 顶层目录必须显式列出：process.cwd() 是调用 pm2 的目录，写成 './log/x.log'
//     会在从别的目录 reload 时建出 ./log/ 造成路径漂移
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;                          // 代码根目录（本文件所在目录）
const TEST_ROOT = path.join(path.dirname(ROOT), 'mud-test');  // 测试服目录与代码根【同级】
const HAS_TEST = fs.existsSync(TEST_ROOT);       // 只有该目录存在时才启用测试服

// 单一机器上同时跑两服时 mud-test 存在；别的部署只有代码根目录，则只起正式服，
// 不会因为找不到 mud-test 而启动失败。无需任何环境变量，避免"忘配/配错"。
const apps = [];
if (HAS_TEST) {
  apps.push({
    name: 'mud-game-test',
    script: 'main.js',
    args: '100',
    cwd: TEST_ROOT,
    env: {
      NODE_ENV: 'production',
      SERVER_ID: '100',
      WS_PORT: '31300',
      ADMIN_IPC_PORT: '31303',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: path.join(ROOT, 'log', 'pm2-game-test-error.log'),
    out_file: path.join(ROOT, 'log', 'pm2-game-test-out.log'),
    max_restarts: 10,
    restart_delay: 5000,
    max_memory_restart: '800M',
    kill_timeout: 10000,
    watch: false,
  });
}

apps.push({
  name: 'mud-game',
  script: 'main.js',
  args: '200',
  cwd: ROOT,
  env: {
    NODE_ENV: 'production',
    SERVER_ID: '200',
    WS_PORT: '31301',
    ADMIN_IPC_PORT: '31304',
  },
  log_date_format: 'YYYY-MM-DD HH:mm:ss',
  error_file: path.join(ROOT, 'log', 'pm2-game-error.log'),
  out_file: path.join(ROOT, 'log', 'pm2-game-out.log'),
  max_restarts: 10,
  restart_delay: 5000,
  max_memory_restart: '800M',
  kill_timeout: 10000,
  watch: false,
});

apps.push({
  name: 'mud-web',
  script: 'web.js',
  cwd: ROOT,
  env: {
    NODE_ENV: 'production',
  },
  log_date_format: 'YYYY-MM-DD HH:mm:ss',
  error_file: path.join(ROOT, 'log', 'pm2-web-error.log'),
  out_file: path.join(ROOT, 'log', 'pm2-web-out.log'),
  max_restarts: 10,
  restart_delay: 5000,
  max_memory_restart: '500M',
  kill_timeout: 10000,
  watch: false,
});

module.exports = { apps };
