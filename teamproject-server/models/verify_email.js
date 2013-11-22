var mongoose = require("mongoose"),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var VerifyEmailSchema = module.exports = new Schema({
  user_id: {type: String, required: true, trim: true, index: {unique: true, dropDups: true}},
  hash_key: {type: String, required: true, trim: true},
  expire: {type: Date, default: Date.now}
}, { versionKey: false });

mongoose.model('VerifyEmail', VerifyEmailSchema);