var config = require("../config");
var md5 = require("MD5");
var redis = require("redis");

var queueEmail = function(to, subject, content, next) {

    var mail_object = JSON.stringify({
        email: to, // list of receivers
        subject: subject, // Subject line
        content: content // html body
        //text: ""
    });

    var client = redis.createClient(config.redis_port, config.redis_host);
    
    client.on("connect", function() {
        client.rpush("mailer", mail_object, function(error, count) {
            if (error) return next(error);
            client.quit();
            return next();
        });
    });

    client.on("error", function(error) {
        console.log(error);
    });
};

exports.send_verify = function(email, hash, next) {

    var subject = "[팀프로젝트] 이메일을 확인해 주세요.";
    var verify_url = "http://tp.mtreesoft.com/verify_email/" + hash;
    var content = "<b>안녕하세요, 팀프로젝트입니다.<br />가입을 완료하기 위해서는 아래 링크를 클릭하여 이메일 주소를 확인해야 합니다.</b><br /><br /><a href=\""+verify_url+"\">이메일 주소 확인</a>";

    queueEmail(email, subject, content, function(error, response) {
        if(error) return next(error);
        return (next);
    });

};

exports.send_password_changed = function(email, password, next) {

    var subject = "[팀프로젝트] 계정 패스워드가 변경되었습니다.";
    var content = "<p>안녕하세요, 팀프로젝트입니다.<br />계정의 패스워드가 변경되었습니다.<br />새로운 패스워드는 " + password + "입니다. 로그인 후 변경하여 사용하세요.</p>";

    queueEmail(email, subject, content, function(error, response) {
        if(error) return next(error);
        return (next);
    });
};