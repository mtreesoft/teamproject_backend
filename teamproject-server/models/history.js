var mongoose = require("mongoose"),
	Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var HistorySchema = module.exports = new Schema({
	user: {type: ObjectId, ref: "User"},	// history owner
	todo: {type: ObjectId, ref: "Todo"},	// if todo event
	date: {type: Date, default: Date.now},	// history date
	text: {type: String}					// description
}, { versionKey: false });

mongoose.model("History", HistorySchema);