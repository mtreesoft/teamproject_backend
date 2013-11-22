var mongoose = require("mongoose"),
	tree = require("mongoose-tree"),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Comment = require("../models/comment");

var TodoSchema = module.exports = new Schema({
	title:			{type: String},						// 업무 내용
	users:			[{type: ObjectId, ref: "User"}],	// 업무 담당자
	path:			{type: String, default:null},		// 위치 경로
	create_date:	{type: Date, default:Date.now},		// 생성일
	start_date:		{type: Date, default:Date.now},		// 시작 날짜
	end_date:		{type: Date, default:Date.now},		// 계획 날짜
	close_date:		{type: Date},						// 실제 종료 날짜
	done:			{type: Boolean, default: false},	// 완료 여부
	comments:		[Comment],							// 덧글
	deleted:		{type: Boolean, default: false},	// 삭제여부
}, { versionKey: false });

TodoSchema.plugin(tree);

// res.send시 JSON으로 시리얼라이징 했을 때, 리턴 전 특정 값을 조작
TodoSchema.methods.toJSON = function() {
  
  obj = this.toObject();
  
  if (this.get_all !== true) {
	
		if (obj.users) obj.user_cnt = obj.users.length;
		if (obj.comments) obj.comment_cnt = obj.comments.length;

		delete obj.users;
		delete obj.comments;
  }

  delete obj.__v;
  return obj;
};

mongoose.model("Todo", TodoSchema);