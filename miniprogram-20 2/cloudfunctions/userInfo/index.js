// 云函数入口文件
const update = require('./update/index');

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'update':
            return await update.main(event, context);
        
    }

}