const cloud = require('wx-server-sdk');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
    const queryResult =  await db.collection('starred')
        .where({
            // 只查每个用户自己的收藏
            openId:event.userInfo.openId
        })
        .get();
    const {data,errMsg} = queryResult;
    if (errMsg == "collection.get:ok") {//根据errMsg的值决定返回的结构
        return {
            errCode:0,//用统一的错误码处理查询结果
            errMsg:errMsg,
            questionList:data,//数据库查出来的题目
        }
    }else{
        return {
            errCode:1,
            errMsg:errMsg,
        }
    }
};