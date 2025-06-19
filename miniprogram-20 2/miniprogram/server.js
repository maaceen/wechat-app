const express=require('express')
const bodyParser =require('body-parser')
const app=express()
const mysql = require('mysql2')
// const mysql = require('mysql2/promise');
const crypto = require('crypto');
app.use(bodyParser.json())

//处理post请求
app.post('/',(req,res) => {
  console.log(req.body)
  res.json(req.body)
})

app.get('/',(req,res)=>{
  var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'mxc247831',
    database:'wechat'
  });
  connection.connect();
  //查找所有的人物名字返回给客户端。其实没必要（测试用的）
  connection.query('select * from users',function(error,results,fields){
    if(error) throw error;
    res.json(results)
    console.log(results)
  })
  connection.end();
})
// 保存考试成绩
app.post('/save', async (req, res) => {
  console.log(req.body);
  var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'mxc247831',
    database:'wechat'
  });
  connection.connect();
  try {
    const { userId, score, correctCount, wrongCount } = req.body;
    const accuracy = (correctCount / (correctCount + wrongCount))* 100;
    
    connection.query(
      'INSERT INTO exam_history (user_id, score, correct_count, wrong_count, accuracy) VALUES (?, ?, ?, ?, ?)',
      [userId, score, correctCount, wrongCount, accuracy]
    );
    
    res.json({ success: true});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get('/getExamScore',(req,res)=>{
  var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'mxc247831',
    database:'wechat'
  });
  connection.connect();
  connection.query(`SELECT * FROM exam_history`,function(error,results,fields){
    if(error) throw error;
    res.json(results)
  })
  connection.end();
})

app.listen(3000,()=>{
  console.log('server running at http://127.0.0.1:3000')
})
