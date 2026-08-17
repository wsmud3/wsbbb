// 服务器地址配置
// 网页版默认使用相对路径；打包 APK 时通过 VITE_ 环境变量覆盖
// 用法: VITE_API_BASE=http://host:port/ VITE_WS_HOST=host VITE_WS_PORT=port npm run build
export const API_BASE = import.meta.env.VITE_API_BASE || '/';
export const WS_HOST = import.meta.env.VITE_WS_HOST || null;
export const WS_PORT = import.meta.env.VITE_WS_PORT || null;
