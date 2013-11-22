var config = require("./config").config;
var redis = require("redis");
var nodemailer = require("nodemailer");

var transport = nodemailer.createTransport("SMTP",{
    service: config.email_account.service,
    auth: {
        user: config.email_account.user,
        pass: config.email_account.passwd
    }
});

function sendEmailFromQueue() {

    client.lpop("mailer", function(error, result) {

	if (error) {
		console.log(error);
		setTimeout(sendEmailFromQueue, config.error_sleep);
		return;
	}

	if (!result) {
		setTimeout(sendEmailFromQueue, config.default_sleep);
		return;
	}

	result = JSON.parse(result);

	transport.sendMail({
			from: config.email_from,
			to: result.email,
			subject: result.subject,
			html: result.content,
			text: (typeof(result.text) != "undefined") ? result.text : ""
		}, function(error, response){
			if(error) console.log(error);
			setTimeout(sendEmailFromQueue, config.default_sleep);
		});

	});
}


var client = redis.createClient(config.redis_port, config.redis_host);
client.on("connect", sendEmailFromQueue);
client.on("error", function(error){
	console.log(error);
	setTimeout(function(){
		process.exit(1);
	}, config.quit_sleep);
});