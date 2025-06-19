const analysisData = {
  accuracy: [],
  correctCounts: [],
  scores: [],
  wrongCounts: []
};
Page({
  /**
     * 组件的属性列表
     */
    properties: {

    },
    data: {
      analysisData:null,
      // 其他页面数据...
    isLoading: true,    // 加载状态
    isEmpty: false      // 空数据状态
    },
    //从exam_history数据库中查询用户的历史做题记录
    getHistoryScore(){
      const that = this;
      wx.request({
        url: 'http://127.0.0.1:3000/getExamScore',
        success:function(res){
          console.log(res.data[0]);

          // 遍历填充数据
        res.data.forEach(item => {
          analysisData.accuracy.push(item.accuracy);
          analysisData.correctCounts.push(item.correct_count);
          analysisData.scores.push(item.score);
          analysisData.wrongCounts.push(item.wrong_count);
      });
      that.setData({
        analysisData:analysisData
      })
      
      console.log('数据存储完成:',analysisData);
        }
      })
    },

    onLoad(options) {
      //加载页面时，调用此函数
      this.getHistoryScore()
  },
})