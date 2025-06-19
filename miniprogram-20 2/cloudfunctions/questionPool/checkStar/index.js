const cloud = require('wx-server-sdk');
const md5 = require('md5');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
// 查看题目是否已经被收藏
exports.main = async (event, context) => {
    const {
        questionId,
        userInfo
    } = event;
    const recordId = md5(questionId + userInfo.openId);
    console.log(recordId);
    // 返回id为recordId的题目有几条，若被收藏过应该有一条
    return await db.collection('starred').where({
            _id: recordId
        })
        .count();
};