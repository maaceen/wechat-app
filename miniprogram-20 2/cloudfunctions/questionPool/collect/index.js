const cloud = require('wx-server-sdk');
const md5 = require('md5');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;
// 添加错题本
exports.main = async (event, context) => {
    console.log(event);
    const {
        questionId,
        userInfo
    } = event;
    const recordId = userInfo.openId;
    // 查询题目是否之前就存在在错题本中，如果存在，就进行更新而不是插入
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
    // total若大于0表明题目之前已经存在于错题本（数据库），进行更新
    if (total) { //进行更新
        
        const updateResult = await db.collection('collection')
            .doc(recordId)
            .update({
                data: {
                    idList: _.addToSet(questionId)
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
    } else { //之前不在错题本
        // 向数据库中添加错题
        const addResult = await db.collection('collection')
            .doc(recordId)
            .set({
                data: {
                    idList: [questionId]
                }
            })
        console.log(addResult);
        // 查看添加后返回的信息
        const {
            errMsg
        } = addResult;
        if (errMsg == "document.set:ok") {
            return {
                errCode: 0,
                errMsg: "OK",
            }
        } else {
            return {
                errCode: 3,//插入出错
                errMsg: errMsg,
            }
        }
    }
};