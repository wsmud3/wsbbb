// pm2 进程定义。
//
// 路径一律从本文件位置（__dirname）推导，不要写死绝对路径：
//   - 部署目录可能不在 /home/mud/mud（隔离改造后测试服就用独立目录）
//   - pm2 用相对路径时会以「调用 pm2 时的 cwd」为基准，
//     一旦换个目录执行 pm2 start/reload，日志就会写到别处甚至建目录失败
// 因此这里统一用 __dirname 拼绝对路径，任何 cwd 下都得到相同结果。
const path = require('path');

const ROOT = __dirname;                 // 代码根目录（本文件所在目录）
const TEST_ROOT = path.join(ROOT, 'mud-test');  // 测试服独立工作目录
const LOG_DIR = path.join(ROOT, 'log');          // 日志统一放正式服目录下

module.exports = {
  apps: [
    {
      name: 'mud-game-test',
      script: 'main.js',
      args: '100',
      // 测试服跑在独立目录（与正式服代码/权限隔离），但日志仍写回 log/
      cwd: TEST_ROOT,
      env: {
        NODE_ENV: 'production',
        SERVER_ID: '100',
        WS_PORT: '31300',
        ADMIN_IPC_PORT: '31303',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: path.join(LOG_DIR, 'pm2-game-test-error.log'),
      out_file: path.join(LOG_DIR, 'pm2-game-test-out.log'),
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '800M',
      kill_timeout: 10000,
      watch: false,
    },
    {
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
      error_file: path.join(LOG_DIR, 'pm2-game-error.log'),
      out_file: path.join(LOG_DIR, 'pm2-game-out.log'),
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '800M',
      kill_timeout: 10000,
      watch: false,
    },
    {
      name: 'mud-web',
      script: 'web.js',
      cwd: ROOT,
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: path.join(LOG_DIR, 'pm2-web-error.log'),
      out_file: path.join(LOG_DIR, 'pm2-web-out.log'),
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '500M',
      kill_timeout: 10000,
      watch: false,
    },
  ],
};
