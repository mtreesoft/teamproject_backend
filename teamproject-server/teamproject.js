var express = require("express");
var http = require("http");
var path = require("path");
var i18n = require("i18n");
var config = require("./config");
var mongoose = require("mongoose");
var expressValidator = require("express-validator");

var app = express();

i18n.configure({
    locales: config.locales,
    defaultLocale: config.default_locale,
    directory: __dirname + "/locales"
});

global.db = mongoose.connect(config.mongodb.dsn, {mongos: true, server: {auto_reconnect:true}});

global.db.connection.on("error", function(error) {
    console.error("Error in MongoDb connection: " + error);
    mongoose.disconnect();
});

app.set("port", process.env.PORT || 8000);
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
// app.use(express.compress());
app.use(i18n.init);
app.use(expressValidator());

var MongoStore = require("connect-mongo")(express);
app.use(express.cookieParser());
app.use(express.session({
  secret:config.session.secret,
  cookie: {
    expires: false,
    path: config.session.path,
    httpOnly: true,
    domain: config.session.domain,
    stringify: false,
  },
  key: config.session.key,
  store: new MongoStore({mongoose_connection: global.db.connection})
}));

app.use(app.router);

app.use(function(err, req, res, next) {
  if(!err) return next();
  res.status(200);
  res.send({"code":"error", "message":err.message});
});

// development only
if ("development" == app.get("env")) {
  app.use(express.errorHandler());
}

var routes = require("./routes");

app.post("/api/auth/join",     routes.auth.join);     // 가입
app.post("/api/auth/login",    routes.auth.login);    // 로그인
app.post("/api/auth/logout",   routes.auth.logout);   // 로그아웃
app.get("/api/auth/me",       routes.auth.me);       // 내 정보
app.post("/api/auth/check_id", routes.auth.check_id); // 아이디 중복 확인
app.post("/api/auth/reset_pw", routes.auth.reset_pw); // 패스워드 초기화
app.post("/api/auth/edit",     routes.auth.edit);     // 회원정보 수정

app.get("/verify_email/:hash", routes.auth.verify_email); // 이메일 해시 확인

app.post("/api/todo",          routes.todo.create);  // 생성
app.get("/api/todo",           routes.todo.list);    // 리스트
app.get("/api/todo/:id",       routes.todo.get);     // 조회
app.put("/api/todo/:id",       routes.todo.edit);    // 수정
app.del("/api/todo/:id",       routes.todo.remove);  // 삭제
app.get("/api/todo/:id/users", routes.todo.users);   // 유저 조회
app.get("/api/todo/:id/comment", routes.comment.get_comment);   // 코멘트 조회
app.get("/api/todo/:id/:depth", routes.todo.get_with_depth); // 뎁스로 조회
app.post("/api/todo/:id/comment", routes.comment.post_comment);   // 코멘트 작성
app.del("/api/todo/:id/comment/:cid", routes.comment.remove_comment); // 코멘트 삭제


app.search("/api/search/user/:query",   routes.search.user); // 유저 검색

app.use(express.static(__dirname + "/../teamproject-client/"));

http.createServer(app).listen(app.get("port"), function(){
  console.log("TeamProject server listening on port " + app.get("port"));
});
