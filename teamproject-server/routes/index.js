// 데이터베이스 모델 로딩
require("../models");

exports = module.exports = {
	auth:    require("./auth"),
	todo:    require("./todo"),
	comment: require("./comment"),
	search:	require("./search")
};