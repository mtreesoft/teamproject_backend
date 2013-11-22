var mongoose = require("mongoose"),
	md5 = require("MD5");

var User = mongoose.model("User");
var Todo = mongoose.model("Todo");
var Comment = mongoose.model("Comment");

var Response = require("../lib/response");
var TeamProjectError = require("../lib/error");


exports.get_comment = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), deleted: false}).populate("comments.user").exec(function(error, todo) {
			
			if (error) return next(new TeamProjectError(error));
			
			if (!todo)
				return next(new TeamProjectError(res.__("Todo is not found")));
			
			todo.get_all = true;

			res.send(new Response("ok", todo.comments));
			return (next);
		});
	});
};

// 코멘트
exports.post_comment = function(req, res, next) {

	req.assert("text", res.__("text is required.")).notEmpty();
	
	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		var comment = new Comment();
		comment.user = new User(req.session.user);
		comment.text = req.param("text");

		Todo.update({_id: req.param("id"), deleted: false},
			{$push: {comments:comment}}, function(error) {
			
			if (error) return next(new TeamProjectError(error));
			
			res.send(new Response("ok"));

		});
	});
};

exports.remove_comment = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), deleted: false}, function(error, todo) {
			
			if (error) return next(new TeamProjectError(error));
			
			if (!todo)
				return next(new TeamProjectError(res.__("Todo is not found")));
			
			todo.comments.remove({_id:req.param("cid"), user:req.session.user._id});
			todo.save(function(error) {
				if (error) return next(new TeamProjectError(error));
				res.send(new Response("ok"));
			});
		});
	});

};