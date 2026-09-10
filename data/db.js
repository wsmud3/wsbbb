const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

class SqliteDatabase {
	db_path = null;
	constructor() {
		this.db = null;
		this.stmtCaches = new Map();
	}

	// 获取预编译语句（带缓存）
	getStmt(sql) {
		let stmt = this.stmtCaches.get(sql);
		if (!stmt) {
			stmt = this.db.prepare(sql);
			this.stmtCaches.set(sql, stmt);
		}
		return stmt;
	}

	// 初始化数据库
	async init(db_name) {
		try {
			if (this.db) this.db.close();
			this.stmtCaches.clear();
			this.db_path = path.isAbsolute(db_name) ? db_name : path.join(__dirname, db_name);
			const fileExists = await this.checkDbFileExists();

			if (!fileExists) {
				console.log("数据库文件不存在，正在创建...");
				this.db = new Database(this.db_path);
				await this.executeDefaultScripts();
				console.log("数据库初始化完成");
			} else {
				console.log("数据库文件已存在，正在连接...");
				this.db = new Database(this.db_path);
				await this.executeAlterScripts();
				console.log("数据库连接成功");
			}
		} catch (error) {
			console.error("数据库初始化失败:", error);
			throw error;
		}
	}

	// 检查数据库文件是否存在
	async checkDbFileExists() {
		try {
			await fs.access(this.db_path);
			return true;
		} catch (error) {
			return false;
		}
	}

	// 执行 ALTER 脚本（数据库已存在时）
	async executeAlterScripts() {
		for (let sql of ALTER_SCRIPTS) {
			try {
				await this.query(sql);
			} catch (error) {
				console.error(sql, "查询失败", error);
			}
		}
	}

	// 执行默认建表脚本（数据库新建时）
	async executeDefaultScripts() {
		this.db.transaction(() => {
			for (const sql of DEFAULT_TABLE_SCRIPTS) this.db.exec(sql);
		})();
	}

	// 执行 INSERT/UPDATE/DELETE 等操作
	query(sql, params = []) {
		return new Promise((resolve, reject) => {
			try {
				const stmt = this.getStmt(sql);
				const info = stmt.run(...params);
				resolve({ lastID: info.lastInsertRowid, changes: info.changes });
			} catch (err) {
				console.error("SQL执行错误:", err);
				reject(err);
			}
		});
	}

	runSync(sql, params = []) {
		const info = this.getStmt(sql).run(...params);
		return { lastID: info.lastInsertRowid, changes: info.changes };
	}

	// 查询单行数据
	get(sql, params = []) {
		return new Promise((resolve, reject) => {
			try {
				const stmt = this.getStmt(sql);
				const row = stmt.get(...params);
				resolve(row);
			} catch (err) {
				console.error("SQL查询错误:", err);
				reject(err);
			}
		});
	}

	getSync(sql, params = []) {
		if (!this.db) throw new Error("数据库未连接");
		return this.getStmt(sql).get(...params);
	}

	// 查询多行数据
	all(sql, params = []) {
		return new Promise((resolve, reject) => {
			try {
				const stmt = this.getStmt(sql);
				const rows = stmt.all(...params);
				resolve(rows);
			} catch (err) {
				console.error("SQL查询错误:", err);
				reject(err);
			}
		});
	}

	// 关闭数据库连接
	close() {
		return new Promise((resolve, reject) => {
			try {
				if (this.db) {
					this.db.close();
					this.db = null;
				}
				this.stmtCaches.clear();
				resolve();
			} catch (err) {
				console.error("关闭数据库连接失败:", err);
				reject(err);
			}
		});
	}
}

// 导出单例
module.exports = new SqliteDatabase();

// ---------- 建表及初始脚本 ----------
const DEFAULT_TABLE_SCRIPTS = [
	`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(60) NOT NULL,
      pwd VARCHAR(60) NOT NULL,
      phone VARCHAR(20),
      state INTEGER DEFAULT 1,
      level INTEGER DEFAULT 0,
      create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (name)
    )`,
	`CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(60) NOT NULL,
      ip VARCHAR(60) NOT NULL,
      port VARCHAR(60) NOT NULL,
      state INTEGER DEFAULT 1,
      isdef INTEGER DEFAULT 0,
      istest INTEGER DEFAULT 0,
      create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
	`CREATE TABLE IF NOT EXISTS players (
      id VARCHAR(40) NOT NULL,
      name VARCHAR(30) NOT NULL,
      userid INTEGER NOT NULL,
      sid INTEGER NOT NULL,
      level INTEGER DEFAULT 0,
      title VARCHAR(30) NOT NULL,
      data TEXT,
      create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
	`CREATE TABLE IF NOT EXISTS players_bak (
      id VARCHAR(40) NOT NULL,
      name VARCHAR(30) NOT NULL,
      userid INTEGER NOT NULL,
      sid INTEGER NOT NULL,
      level INTEGER DEFAULT 0,
      title VARCHAR(30) NOT NULL,
      data TEXT,
      create_time TIMESTAMP,
      update_time TIMESTAMP 
    )`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name ON users (name)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_players_id ON players (id)`,
	`CREATE INDEX IF NOT EXISTS idx_players_userid ON players (userid)`,
	`CREATE INDEX IF NOT EXISTS idx_players_sid ON players (sid)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name ON players (name)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_players_bak_id ON players_bak (id)`,
	// 单条初始化语句；新库不得启用已知弱密码管理员，现有账户保持不变。
	`INSERT OR IGNORE INTO users(id,name,pwd,level,state) VALUES(1,'administrator','${MD5(process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(32).toString('hex'))}',6,${(process.env.INITIAL_ADMIN_PASSWORD || '').length >= 16 ? 1 : 0})`,
	`INSERT OR IGNORE INTO servers(id,name,ip,port,istest,isdef) VALUES(100,'本地测试','127.0.0.1','31300',1,0)`,
	`INSERT OR IGNORE INTO servers(id,name,ip,port,istest,isdef) VALUES(200,'正式服','127.0.0.1','31301',0,1)`,
];

function MD5(str) {
	let md5 = crypto.createHash("md5");
	let result = md5.update(str + process.env.MD5_PREFIX).digest("hex");
	return result.toUpperCase();
}

const ALTER_SCRIPTS = [
	`INSERT OR IGNORE INTO servers(id,name,ip,port,istest,isdef) VALUES(100,'本地测试','127.0.0.1','31300',1,0)`,
	`INSERT OR IGNORE INTO servers(id,name,ip,port,istest,isdef) VALUES(200,'正式服','127.0.0.1','31301',0,1)`,
	// 后台"全部玩家/统计"按服务器查询，补一个 sid 索引（IF NOT EXISTS 幂等，可重复执行）
	`CREATE INDEX IF NOT EXISTS idx_players_sid ON players (sid)`,
];
