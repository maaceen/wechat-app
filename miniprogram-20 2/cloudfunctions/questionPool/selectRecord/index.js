const cloud = require('wx-server-sdk');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
/**
 * 分页查询题目列表
 * @param {*} event 
 */
async function getPageData(event){
    const queryResult =  await db.collection('question')
        .skip((event.page - 1) * event.size)
        .limit(event.size)
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
}
/**
 * 随机查询题目列表
 * @param {*} event 
 */
// 随机查询指定数量的题目
async function getRandomList(event){
    const queryResult = await db.collection('question')
    .aggregate()
    .sample({
        size:event.size
    })
    .end()
    const {list,errMsg} = queryResult;
    if (errMsg == "collection.aggregate:ok") {//根据errMsg的值决定返回的结构
        return {
            errCode:0,//用统一的错误码处理查询结果
            errMsg:errMsg,
            questionList:list,//数据库随机查出来的题目
        }
    }else{
        return {
            errCode:1,
            errMsg:errMsg,
        }
    }
}
// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
    // 返回数据库查询结果
//    return getPageData(event)
    return getRandomList(event);
};