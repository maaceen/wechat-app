const cloud = require('wx-server-sdk');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();


exports.main = async (event, context) => {
    const {
        nickName,
        avatarUrl,
        isVip,
        userInfo
    } = event;
    const recordId = userInfo.openId;
    let userData={
        openId:userInfo.openId,
    }
    if(isVip != undefined){
        userData={
            ...userData,
            isVip,
        }
    }
    if(nickName != undefined){
        userData={
            ...userData,
            nickName,
        }
    }
    if(avatarUrl != undefined){
        userData={
            ...userData,
            avatarUrl,
        }
    }
    const addResult = await db.collection('user')
        .doc(recordId)
        .set({
            data:userData
        })
        console.log(addResult);
        const{
            errMsg
        }=addResult;
        if(errMsg == "document.set:ok"){
            return{
                errCode:0,
                errMsg:"OK",
            }
        }else{
            return{
                errCode:3,
                errMsg:errMsg,
            }
        }
};