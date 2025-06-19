const cloud = require('wx-server-sdk');
const md5 = require('md5');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 添加收藏
exports.main = async (event, context) => {
    // event里面有question（包含_id（题目id）），userInfo（包含appId,openId）
    // 将event中的question,userInfo取出来
    const {
        question,
        userInfo
    } = event;
    // question中添加openId，questionId两个属性
    question.openId = userInfo.openId;
    question.questionId = question._id;
    // 将question中的_id赋值给_id,剩下的内容赋值给restObj这个对象
    const {
        _id,
        ...restObj
    } = question;
    // 将_id和用户的openId做md5摘要，生成recordId，保证收藏的题目唯一
    const recordId = md5(_id + userInfo.openId);
    // 将收藏的题目保存到云数据库
    return await db.collection('starred').doc(recordId).set({
        data: restObj
    })
};