exports.config = {

	email_account: {service:"Gmail",
		from: "TEAMPROJECT <teamproject.master@gmail.com>",
		user: "teamproject.master@gmail.com",
		passwd: ""},

	redis_host: "localhost",			// redis 서버 host
	redis_port: 6379,					// redis 서버 port
	default_sleep: 100,					// 메일 전송간 기본 sleep
	error_sleep: 1000,					// 오류가 났을 때 다음 작업간 sleep
	quit_sleep: 5000,					// 오류로 앱이 종료되기 전 sleep
};