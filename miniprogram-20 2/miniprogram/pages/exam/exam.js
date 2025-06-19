// pages/exam/exam.js
Page({

    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {

        // 当前是第几题
        currentIndex: 0,
        // 题目总数
        total: 0,
        // 标记是否收藏
        isStarted: false,
        // 此属性在页面加载返回数据库数据后自动添加
        quetion: null,
        questionList: [],
        // 是否完成了答题
        finish: false,
        score:0,
        correctCount:0,
        wrongCount:0

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
        // 点了对答案后调用此函数，根据做题正确与否判断是否添加错题本
        this.addCollection()
    },
    //从云数据库中查询题目
    getList() {
        const that = this;
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: "selectRecord",
                    //第几页
                    page: 1,
                    //每一页有几道题
                    size: 200,
                }
            })
            .then(res => {
                // 将res.result中的data（是一个包含多个对象的数组），errMsg(是一个字符串，表明了查询是否成功)
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
                    that.checkStar(question._id)
                    that.setData({
                        // 相当于把questionList，total，question都放到了exam.js中的data内
                        questionList,
                        total,
                        question,
                    });
                } else {
                    console.log(errMsg);
                    wx.showToast({
                        title: '查询题目失败',
                        icon: "error",
                    })
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
    // 切换到上一页
    goPrev() {
        const that = this;
        const newIndex = that.data.currentIndex - 1;
        if (newIndex < 0) {
            console.log("已经是第一题");
            return;
        }
        // 取出上一题的question赋值给tempQuestion
        const tempQuestion = that.data.questionList[newIndex];
        // 设置question前先检查是否收藏
        that.checkStar(tempQuestion._id);
        this.setData({
            // 更新当前是第几题，更新question
            currentIndex: newIndex,
            question: tempQuestion,
        })
    },
    //   切换到下一页
    goNext() {
        const that = this;
        if(!that.data.question.userAnswer){
            console.log("用户还未回答，不跳转");
            wx.showToast({
              title: '请先回答本题',
              icon:"none"
            })
            return;
        }
        // 点了下一页时，此时如果用户选择了选项并选错了，不用点对答案，也会自动把题目加入到错题本
        // 切换前:验证是否答错并加入错题集
        that.addCollection();
        const newIndex = that.data.currentIndex + 1;
        if (newIndex > that.data.questionList.length - 1) {
            console.log("已经是最后一题");
            return;
        }
        const tempQuestion = that.data.questionList[newIndex];
        that.checkStar(tempQuestion._id);
        this.setData({
            currentIndex: newIndex,
            question: tempQuestion,
        })
    },
    // 用户答完最后一道题，显示结果页的函数
    goResult(){
        const that = this;
        if(!that.data.question.userAnswer){
            console.log('用户还未回答，不跳转');
            wx.showToast({
              title: '请先回答本题',
            })
            return;
        }
        // 统计正确的数量
        const correctCount = that.data.questionList.reduce((val,cur)=>{
            if(that._isCorrect(cur)){
                val += 1
            }
            return val;
        },0)
        // 统计错误的数量
        const wrongCount = that.data.questionList.reduce((val,cur)=>{
            if(!that._isCorrect(cur)){
                val += 1
            }
            return val;
        },0)
        // 计算分数
        const score = Math.round((correctCount * 100) / that.data.total)
        that._recordScore(score)
        that.setData({
            correctCount,
            wrongCount,
            score,
            finish:true,
        });
    },
    //答完题最后记录分数
    _recordScore(score){
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: "recordScore",
                    score:score,
                }
            })
            .then(res => {
                const {errCode,errMsg} = res.result;
                if(errCode == 0){
                    console.log(`已记录用户分数${score}`);
                }else{
                    console.error(errMsg)
                }
            })
            .catch(console.error)
    },
    // 判断用户的选择是否正确
    _isCorrect(question){
        return question.answer.sort().join() === question.userAnswer.sort().join();
        
      },
    //   添加做错的题目到错题本
    addCollection(){
        const that = this;
        let tempQuestion = that.data.question;
        // 判断用户有没有选择选项
        if(!tempQuestion.userAnswer){
            console.log("用户还未回答，不加错题本逻辑");
            return;
        }
        // 如果用户选择了选项并答对了
        if(that._isCorrect(tempQuestion)){
            console.log("用户答对了，不加错题本逻辑");
            return;
        }
        // 用户打错了就会调用下面来的云函数
        wx.cloud
        .callFunction({
            name:"questionPool",
            data:{
                type:"collect",
                questionId:tempQuestion._id,
            }
        })
        .then(res=>{
            // console.log(res);
            const {errCode,errMsg} = res.result;
            if(errCode == 0){
                console.log(`${tempQuestion.title}已加入错题本`);
            }else{
                console.error(errMsg)
            }
        })
        .catch(console.error)
      },
    /**
     * 生命周期函数--监听页面加载
     */
    // 点击收藏后，调用这个函数
    addStar() {
        const that = this;
        // 添加到收藏本时，如果提交前三个字段，查看收藏本时，就会带着之前的做题状态，故不提交这三个字段
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
    gotoCollection(){
        wx.redirectTo({
          url: '/pages/collection/collection',
        })
    },
    goHome(){
        wx.redirectTo({
          url: '/pages/index/index',
        })
    },
    submitScore(){
      console.log('chengji');
      console.log(this.data.correctCount);
      wx.request({
        url: 'http://127.0.0.1:3000/save',
        method: 'POST',
        data: {
          userId: 1, // 假设用户ID存储在全局
          score: this.data.score,
          correctCount: this.data.correctCount,
          wrongCount: this.data.wrongCount
        },
        success: (res) => {
          if (res.data.success) {
            console.log('成绩保存成功');
          }
        },
        fail: (err) => {
          console.error('保存成绩失败:', err);
        }
      });
    },
    onLoad(options) {
        //加载页面时，调用此函数
        this.getList()
    },
})