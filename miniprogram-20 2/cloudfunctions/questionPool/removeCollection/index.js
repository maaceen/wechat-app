const cloud = require('wx-server-sdk');
const md5 = require('md5');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;
// 从错题本删除
exports.main = async (event, context) => {
    console.log(event);
    const {
        questionId,
        userInfo
    } = event;
    const recordId = userInfo.openId;
    // 查询题目是否存在在错题本中
    const countResult = await db.collection('collection')
        .where({
            _id: recordId
        })
        .count();
    console.log(countResult);
    const {
        errMsg,
        total
    } = countResult;
    if (errMsg !== "collection.count:ok") {
        return {
            errCode: 1,//查询出错
            errMsg: errMsg,
        };
    }
    // total若大于0表明题目在错题本（数据库）
    if (total) { //进行删除
        
        const updateResult = await db.collection('collection')
            .doc(recordId)
            .update({
                data: {
                    idList: _.pull(questionId)
                }
            });
        console.log(updateResult);
        const {
            errMsg
        } = updateResult;
        if (errMsg == "document.update:ok") {
            return {
                errCode: 0,
                errMsg: "OK",
            }
        } else {
            return {
                errCode: 2,//更新出错
                errMsg: errMsg
            }
        }
    } else { 
        return {
            errCode:0,
            errMsg:"用户错题已清空"
        }
    }
};