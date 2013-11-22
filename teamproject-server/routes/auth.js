var mongoose = require("mongoose"),
	md5 = require("MD5"),
	mailer = require("../lib/mailer");

var Response = require("../lib/response");
var TeamProjectError = require("../lib/error");

var User = mongoose.model("User");
var VerifyEmail = mongoose.model("VerifyEmail");

exports.login = function(req, res, next) {

	req.assert("id", res.__("e-mail is required.")).notEmpty();
	req.assert("id", res.__("e-mail is invalid.")).isEmail();
	req.assert("pw", res.__("password is required.")).notEmpty();
	req.assert("pw", res.__("password is too short.")).len(6, 20);

	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));

	User.login(req.param("id"), req.param("pw"), function (error, user) {

		if (error) return next(error);
		
		req.session.user = user;
		res.send(new Response("ok"));
		return (next);
	});
};

exports.logout = function(req, res, next) {
	delete req.session.user;
	req.session.destroy();
	res.send(new Response("ok"));
	return (next);
};

exports.me = function(req, res, next) {
	
	User.authenticationRequired(req, res, function(error) {
		if (error) return next(error);
		res.send(new Response("ok", new User(req.session.user)));
		return (next);
	});
};

exports.join = function(req, res, next) {

	req.assert("id", res.__("e-mail is required.")).notEmpty();
	req.assert("id", res.__("e-mail is invalid.")).isEmail();
	req.assert("pw", res.__("password is required.")).notEmpty();
	req.assert("pw", res.__("Password is invalid. (6~30 digits)")).len(6, 20);

	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));
	
	var user = new User();
	user.user_id = req.param("id");
	user.password = req.param("pw");
	user.save(function (error, data) {
		
		if (error) {

			if (11000 === error.code || 11001 === error.code)
				return next(new TeamProjectError(res.__("You are already registered.")));

			return next(new TeamProjectError(error));

        } else {

			var hash = md5(req.param("id") + "|" + Date.new);

            var verifyemail = new VerifyEmail();
            verifyemail.user_id = req.param("id");
            verifyemail.hash_key = hash;
            verifyemail.expire = new Date(Date.now() + 3600000); // 1 hour? 
            verifyemail.save(function (error, data) {
				if (error) return next(new TeamProjectError(error));
				mailer.send_verify(req.param("id"), hash, function(error){
					if (error) return next(new TeamProjectError(error));
				});
				res.send(new Response("ok"));
				return (next);
            });
		}

	});
};

exports.check_id = function(req, res, next) {

	req.assert("id", res.__("e-mail is required.")).notEmpty();
	req.assert("id", res.__("e-mail is invalid.")).isEmail();

	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));
	
	User.count({user_id:req.param("id")}, function(error, count) {
		
		res.send(new Response("ok", {"result":(count === 0)}));
		return (next);
	});

};

exports.verify_email = function(req, res, next) {

	req.assert("hash", res.__("hash is invalid.")).is(/^[a-z0-9]{32}$/);
	
	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));

	VerifyEmail.findOne({hash_key:req.param("hash")}, function(error, item) {

		if (error) return next(new TeamProjectError(error));
		
		if (!item) {
			res.redirect("/#fail");
			return;
		}
		
		if (item.expire < (new Date())) {
			res.redirect("/#fail");
			item.remove();
			return;
		}

		User.findOneAndUpdate({user_id:item.user_id}, {verify_email:true}, function(error, user) {
			if (error) return next(new TeamProjectError(error));
			item.remove();
			res.redirect("/#success");
		});

	});

};

exports.reset_pw = function(req, res, next) {
	
	req.assert("id", res.__("e-mail is required.")).notEmpty();
	req.assert("id", res.__("e-mail is invalid.")).isEmail();

	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));

	User.findOne({user_id:req.param("id")}, function(error, user) {

		if (error) return next(new TeamProjectError(error));

		if (!user) return next(new TeamProjectError(res.__("user not found.")));
		
		user.reset();

		res.send(new Response("ok"));
		return (next);
	});
};

exports.edit = function(req, res, next) {

	User.authenticationRequired(req, res, function(error) {

		if (error) return next(error);

		req.assert("pw", res.__("password is required.")).notEmpty();
		req.assert("pw", res.__("Password is invalid. (6~30 digits)")).len(6, 20);

		req.sanitize("name");

		var errors = req.validationErrors();

		if (errors)
			return next(new TeamProjectError(errors));
		
		User.findOne({user_id:req.session.user.user_id}, function(error, user) {

			if (error) return next(new TeamProjectError(error));
			
			if (!user)
				return next(new TeamProjectError(res.__("user not found.")));
			
			if (req.param("pw"))	user.password = req.param("pw");
			if (req.param("name"))  user.name = req.param("name");
			
			user.save(function(error) {

				if (error) return next(new TeamProjectError(error));

				req.session.user = user;
				
				res.send(new Response("ok"));
				return (next);
			});
		});


	});

};
