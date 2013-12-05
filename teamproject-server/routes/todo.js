var mongoose = require("mongoose"),
	md5 = require("MD5");

var User = mongoose.model("User");
var Todo = mongoose.model("Todo");

var Response = require("../lib/response");
var TeamProjectError = require("../lib/error");

exports.create = function(req, res, next) {

	req.assert("title", res.__("title is required.")).notEmpty();

	var errors = req.validationErrors();

	if (errors)
		return next(new TeamProjectError(errors));

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		var todo = new Todo({
			title:      req.param("title"),
			users:      [req.session.user._id]
		});

		if (req.param("parent")) {

			Todo.findOne({_id: req.param("parent"), deleted: false}, function(error, parent) {

				if (error) return next(new TeamProjectError(error));

				if (!parent) return next(new TeamProjectError(res.__("Parent Todo is not found")));

				if (parent.level >= 5)
					return next(new TeamProjectError(res.__("You can not place more depth.")));

				todo.parent = parent;

				todo.save(function(error) {
					if (error) return next(new TeamProjectError(error));
					res.send(new Response("ok", todo._id));
					return (next);
				});

			});

		} else {

			if (req.param("start_date")) todo.start_date = req.param("start_date");
			if (req.param("end_date")) todo.end_date = req.param("end_date");
			
			todo.save(function(error) {
				if (error) return next(new TeamProjectError(error));
				res.send(new Response("ok", todo._id));
				return (next);
			});
		}
	});
};

exports.list = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.find({users: req.session.user._id, deleted: false, $where:"this.path==this._id"}, function(error, items) {
			
			if (error)
				return next(new TeamProjectError(error));

			if (!items)
				return next(new TeamProjectError(res.__("Todo is not found")));
			
			res.send(new Response("ok", items));

		});
	});
};

exports.get = get_all = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), deleted: false}).exec(function(error, todo) {
			
			if (error) return next(new TeamProjectError(error));
			
			if (!todo)
				return next(new TeamProjectError(res.__("Todo is not found")));
			
			todo.getChildren(true, function(err, todos) {
				res.send(new Response("ok", [todo].concat(todos)));
			});

		});
	});
};

exports.get = get_one = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), deleted: false}).exec(function(error, todo) {
			
			if (error) return next(new TeamProjectError(error));
			
			if (!todo)
				return next(new TeamProjectError(res.__("Todo is not found")));
			
			res.send(new Response("ok", todo));
			return (next);
		});
	});
};

exports.get_depth = get_depth = function(req, res, depth, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), deleted: false}).exec(function(error, todo) {

			todo.getChildren(true, function(error, items) {
				
				if (error)
					return next(new TeamProjectError(error));
				
				var result = [];

				items.forEach(function(item){
					if (item.deleted) return;
					if (item.level <= todo.level+depth)
						result.push(item);
				});

				res.send(new Response("ok", result));

			});
		});
	});
};

exports.get_with_depth = function(req, res, next) {

	var depth = parseInt(req.param("depth"), 10);

	switch (depth) {
		case -1:
			return get_all(req, res, next);

		case 0:
			return get_one(req, res, next);

		default:
			return get_depth(req, res, depth, next);
	}

};

exports.users = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), deleted: false}).populate("users").exec(function(error, todo) {
			
			if (error) return next(new TeamProjectError(error));
			
			if (!todo)
				return next(new TeamProjectError(res.__("Todo is not found")));
			
			res.send(new Response("ok", todo.users));
			return (next);
		});
	});
};


exports.edit = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), deleted: false}, function(error, todo) {

			if (error) return next(error);
			
			if (!todo)
				return next(new TeamProjectError(res.__("Project is not found")));
			
			if (req.param("title"))      todo.title = req.param("title");
			if (req.param("start_date")) todo.start_date = req.param("start_date");
			if (req.param("end_date"))   todo.end_date = req.param("end_date");

			if (typeof(req.param("done")) != "undefined") {
				if (req.param("done") === "true") {
					todo.close_date = new Date();
					todo.done = true;
				} else {
					todo.close_date = null;
					todo.done = false;
				}
			}

			if (req.param("users")) {

				var queue = req.param("users").split(",");
				var user  = null;
				var users = todo.users;

				while ((user = queue.shift())) {
					var flag = user.substring(0,1);
					var user_seq = user.substring(1);
					if (flag == "+") {
						if (users.indexOf(user_seq) == -1) {
							users.push(user_seq);
						}
					} else if (flag == "-") {

						var index = 0;
						while ((index = users.indexOf(user_seq)) >= 0) {
							users.splice(index, 1);
						}
					}
				}

				todo.users = users;
			}


			if (req.param("parent")) {

				Todo.findOne({_id:req.param("parent"), deleted: false}, function(error, parent){

					if (error) return next(new TeamProjectError(error));

					if (parent.level >= 5)
						return next(new TeamProjectError(res.__("You can not place more depth.")));

					todo.parent = parent;
					todo.save(function(error){
						if (error) return next(new TeamProjectError(error));
						res.send(new Response("ok"));
					});
				});

			}
			else
			{
				todo.save(function(error){
					if (error) return next(new TeamProjectError(error));
					res.send(new Response("ok"));
				});
			}

		});
	});
};

exports.remove = function(req, res, next) {

	User.authenticationRequired(req, res, function (error) {

		if (error) return next(error);

		Todo.findOne({_id: req.param("id"), users:req.session.user._id, deleted: false}, function(error, todo) {
			
			if (error) return next(new TeamProjectError(error));
			
			if (!todo)
				return next(new TeamProjectError(res.__("Todo is not found")));

			todo.getChildren(true, function(error, items) {
				
				if (error)
					return next(new TeamProjectError(error));
				
				items.forEach(function(item){
					item.deleted = true;
					item.save();
				});

				todo.deleted = true;
				todo.save();

				res.send(new Response("ok"));
			});
		});
	});
};