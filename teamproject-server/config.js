var ONE_HOUR = 3600000; // 3600초(1시간)

exports = module.exports = {
	locales: ["ko", "en"],
	default_locale: "ko",
	mongodb: {
		dsn: "mongodb://localhost/teamproject",
		database: "teamproject"
	},
	redis: {
		host: "localhost",
		port: 6379
	},
	session: {
		secret: "227c12a1419678db80b7d48f2e8679ea",
		expire: ONE_HOUR,
		key: "SESSION_ID",
		path: "/api/",
		domain: "tp.mtreesoft.com"
	}
};
