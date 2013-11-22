var mongoose = require("mongoose");

var Response = require("../lib/response");
var TeamProjectError = require("../lib/error");

var User = mongoose.model("User");

exports.user = function(req, res, next) {

	req.assert("query", res.__("search query is required.")).notEmpty();
	req.assert("query", res.__("search query is too short.")).len(2);

	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));

	User.authenticationRequired(req, res, function(error) {

		if (error) return next(error);

		var q = req.param("query");
		var query = [{user_id:new RegExp(q)}, {name:new RegExp(q)}];

		User.find({$or:query}, function (error, users) {

			if (error) return next(error);
			
			res.send(new Response("ok", users));
			return (next);
		});

	});
};
