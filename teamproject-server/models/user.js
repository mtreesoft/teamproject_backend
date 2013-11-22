var mongoose = require("mongoose"),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    bcrypt   = require("bcrypt"),
    md5      = require("MD5"),
	mailer   = require("../lib/mailer"),
	i18n     = require("i18n");

var TeamProjectError = require('../lib/error');

var UserSchema = module.exports = new Schema({
  user_id:   {type: String, required: true, trim: true, index: {unique: true, dropDups: true}},
  password:  {type: String, required: true, trim: true},
  name:      {type: String},
  reg_date:  {type: Date, default: Date.now},
  verify_email: {type: Boolean, default: false},
  watch_projects: [{type:ObjectId, ref: "Project"}],
}, { versionKey: false });

UserSchema.path("password").set(function(v){
	return bcrypt.hashSync(v, 10);
});


UserSchema.statics.login = function(id, pw, next) {

	this.findOne({user_id: id}, function (error, user) {

		if (error)
			return next(new TeamProjectError(error));
		
		if (!user)
			return next(new TeamProjectError(i18n.__('Invalid e-mail or password')));

		if (user.verify_email === false)
			return next(new TeamProjectError(i18n.__('Email Address are not verified!')));

		if (user.equals(pw) === false)
			return next(new TeamProjectError(i18n.__('Invalid e-mail or password')));
		
		return next(null, user);
	});
};

// res.send시 JSON으로 시리얼라이징 했을 때, 리턴 전 특정 값을 조작
UserSchema.methods.toJSON = function() {
  obj = this.toObject();
  obj.pic = this.getUserPicture();
  delete obj.password;
  return obj;
};

UserSchema.methods.equals = function(v) {
	return bcrypt.compareSync(v, this.password);
};

UserSchema.methods.reset = function (next) {
	var new_password = Math.random().toString(36).slice(-8);
	mailer.send_password_changed(this.user_id, new_password);
	this.password = new_password;
	this.save(function(error){
		if (error) console.log(error);
		return (next);
	});
};

UserSchema.methods.getUserPicture = function() {
	
	return "http://www.gravatar.com/avatar/" + md5(this.user_id.trim().toLowerCase()) + ".png?d=identicon";
};

var TeamProjectError = require('../lib/error');

// 로그인 되어 있어야 실행되는 코드를 위한 함수
UserSchema.statics.authenticationRequired = function(req, res, next) {
	if (req.session.user) {
		return next();
	} else {
		return next(new TeamProjectError(res.__('not logined.')));
	}
};

UserSchema.set('toJSON', {
	getters: true,
	virtuals: true,
	transform: function(doc, ret, options) {
		console.log(ret);
        delete ret.password;
        return ret;
	}
});

mongoose.model("User", UserSchema);