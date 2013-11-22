var mongoose = require("mongoose"),
	Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CommentSchema = module.exports = new Schema({
	user: {type: ObjectId, ref: "User"},	// 덧글 작성자
	date: {type: Date, default: Date.now},	// 작성일
	text: {type: String}					// 내용
}, { versionKey: false });

mongoose.model("Comment", CommentSchema);