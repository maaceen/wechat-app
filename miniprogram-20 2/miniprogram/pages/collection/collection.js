import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
Page({
    data:{
        //题目是否加载完成
        loadFinish:false,
        // 当前是第几题
        currentIndex: 0,
        // 题目总数
        total: 0,
        // 标记是否收藏
        isStarted: false,
        // 此属性在页面加载返回数据库数据后自动添加
        quetion: null,
        questionList: [],
    },
    goCuoTi(){
      wx.redirectTo({
        url: '/pages/collection/collection',
      })
    },
    goHome(){
        wx.redirectTo({
          url: '/pages/index/index',
        })
    },
    _getList(){
        const that = this;
        
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: "getCollection",
                }
            })
            .then(res => {
                
                const {
                    questionList,
                    errMsg,
                    errCode
                } = res.result;
                if (errCode == 0) {
                    // 记录题目总数
                    const total = questionList.length;
                    //通过currentIndex确定取出第几题，currentIndex是我们在上面的data中自己定义的
                    const question = questionList[that.data.currentIndex];
                    // 题目加载完成后，设置question之前，先看下当前question是否已经被收藏了
                   
                    that.setData({
                        // 相当于把questionList，total，question都放到了exam.js中的data内
                        questionList,
                        total,
                        question,
                    });
                    that.checkStar(question._id)
                } else {
                    console.log(errMsg);
                    wx.showToast({
                        title: '查询题目失败',
                        icon: "error",
                    })
                }
            })
            .catch(console.error)
            .finally(()=>{
                that.setData({
                    loadFinish:true,
                })
            })
    },
    // 切换到上一页
    goPrev() {
        const that = this;
        const newIndex = that.data.currentIndex - 1;
        if (newIndex < 0) {
            console.log('已经是第一题');
            Toast.fail('已经是第一题');
            return;
        }
        // 取出上一题的question赋值给tempQuestion
        const tempQuestion = that.data.questionList[newIndex];
        that.checkStar(tempQuestion._id);
        this.setData({
            // 更新当前是第几题，更新question
            currentIndex: newIndex,
            question: tempQuestion,
        })
    },
    onDelete(){
        const that = this;
        Dialog.confirm({
            title: '',
            message: '确认删除？',
          })
            .then(() => {
                wx.cloud
                .callFunction({
                    name: "questionPool",
                    data: {
                        type: "removeCollection",
                        questionId:that.data.question._id,
                    },
                })
                .then(res => {
                    
                    const {
                        errMsg,
                        errCode
                    } = res.result;
                    if (errCode == 0) {
                        Toast("删除成功");
                        // 排除了当前ID的这道题，剩下的题目组成一个新的数组
                        const tmpQuestionList = that.data.questionList.filter(item=>item._id !==that.data.question._id);
                        const total = tmpQuestionList.length;
                        let newIndex,tempQuestion;
                        //错题本还有题
                        if(total>0){
                            newIndex = that.data.currentIndex;
                            
                            if(newIndex > tmpQuestionList.length - 1){
                                //删掉了最后一题，展示前一道题
                                newIndex = newIndex - 1;
                            }
                            //获取删除后要展示的新题
                            tempQuestion = tmpQuestionList[newIndex]
                            that.checkStar(tempQuestion._id);
                        }else{//题目删完了
                            newIndex=0;
                            tempQuestion = null;
                        }
                        //设置数据，页面重新渲染
                        that.setData({
                            currentIndex:newIndex,
                            questionList:tmpQuestionList,
                            total:total,
                            question:tempQuestion,
                        })
                    } else {
                        Toast.error("删除失败")
                    }
                })
                .catch(console.error)
            })
            .catch(() => {
              // on cancel
            });
        
    },
    //   切换到下一页
    goNext() {
        const that = this;
        
        // 点了下一页时，此时如果用户选择了选项并选错了，不用点对答案，也会自动把题目加入到错题本
        
        const newIndex = that.data.currentIndex + 1;
        if (newIndex > that.data.questionList.length - 1) {
            Toast.success('恭喜，完成了');
            return;
        }
        const tempQuestion = that.data.questionList[newIndex];
        that.checkStar(tempQuestion._id);
        this.setData({
            currentIndex: newIndex,
            question: tempQuestion,
        })
    },
    // 点击收藏后，调用这个函数
    addStar() {
        // 把前三个字段去掉，不提交
        const {showAnswer,starred,userAnswer,...questionForStar} = that.data.question;
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: "addStar",
                    // 把当前的question传给云函数,addStar文件夹下index.js文件中async函数的event参数就包含了question
                    question: questionForStar,
                }
            })
            .then(res => {
                // console.log(res);
                const {
                    errMsg
                } = res.result;
                // 查询成功
                if (errMsg == "document.set:ok") {
                    let tempQuestion = that.data.question;
                    // 添加starred
                    tempQuestion.starred = true;
                    that.setData({
                        // 更新question
                        question: tempQuestion,
                    })
                    wx.showToast({
                        title: '收藏成功',
                        icon: "success",
                        duration: 2000,
                    });
                } else {
                    wx.showModal({
                        title: '收藏失败',
                        content: errMsg,
                        showCancel: false,
                    });
                }
            })

    },
    checkStar(questionId) {
        const that = this;
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: "checkStar",
                    // 向云函数传入题目的id，以便与用户id结合生成唯一的id
                    questionId: questionId,
                },
            })
            .then((res) => {
                // console.log(res.result);
                // 取出来是否查询成功的信息errMsg，和当前id下收藏的题目数total（收藏了的话total应该为1）
                const {
                    errMsg,
                    total
                } = res.result;
                // 查询成功
                if (errMsg == "collection.count:ok") {
                    let tempQuestion = that.data.question;
                    // 添加starred属性判断是否收藏，若已经收藏了starred应为1
                    tempQuestion.starred = total > 0
                    that.setData({
                        // 更新question
                        question: tempQuestion
                    });
                } else {
                    console.warn("查询收藏失败");
                }
            })
            .catch(console.error)
    },
    removeStar() {
        const that = this;
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: "removeStar",
                    questionId: that.data.question._id,
                },
            })
            .then((res) => {
                const {
                    errMsg
                } = res.result;
                if (errMsg == "collection.remove:ok") {
                    let tempQuestion = that.data.question;
                    // 添加starred属性
                    tempQuestion.starred = false;
                    that.setData({
                        question: tempQuestion,
                    })
                    wx.showToast({
                        title: '取消收藏成功',
                        icon: "success",
                        duration: 2000,
                    });
                } else {
                    wx.showToast({
                        title: '取消收藏失败',
                        content: errMsg,
                        showCancel: false,
                    });
                }
            })
            .catch(console.error)
    },
    _collectAnswer(selectedValue,tempQuestion){
        // 如果当前题目是单选题
        if(tempQuestion.type == 'radio'){
            return [selectedValue]
        // 当前是多选题
        }else if(tempQuestion.type == 'checkbox'){
            let currentAnswer = tempQuestion.userAnswer || []
            
            if(currentAnswer.includes(selectedValue)){
                currentAnswer.splice(currentAnswer.indexOf(selectedValue),1)
            }else{
                currentAnswer.push(selectedValue)
                console.log(currentAnswer);
            }
            return currentAnswer.sort();
        }

    },
    // 点击某一选项时触发
    onItemClick(event) {
        console.log(event);
        // 用户点击某一选项时，选项对应的（A,B,C,D）值就存在了event.target.dataset.value，用户的答案赋值给selectedValue
        const selectedValue = event.target.dataset.value;
        let tempQuestion = this.data.question;
        if (tempQuestion.showAnswer) {
            console.log("已经看过答案，不能修改选项");
            return;
        }
        // 给tempQuestion添加一个新的属性userAnswer（将答案转成数组）
        tempQuestion.userAnswer = this._collectAnswer(selectedValue,tempQuestion);
        
        this.setData({
            // 重新赋值question
            // 此时，question中就有userAnswer属性了
            question: tempQuestion,
        })
        
    },
    // 点了对答案的按钮后触发的事件
    onShowAnswer() {
        let tempQuestion = this.data.question;
        // 添加showAnswer属性,判断是否需要显示答案
        tempQuestion.showAnswer = true;
        this.setData({
            // 更新question
            question: tempQuestion,
        })
        
    },
    onLoad: function(options){
        this._getList();
    },
    
})