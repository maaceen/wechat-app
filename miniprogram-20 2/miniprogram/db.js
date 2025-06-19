// exam.js（你的业务逻辑文件）
const db = require('./db');

async function saveExamResult(userId, score, correctCount, wrongCount) {
  let connection;
  try {
    // 从连接池获取连接
    connection = await db.getConnection();
    
    // 执行插入操作
    const [result] = await connection.query(
      'INSERT INTO exam_history (user_id, score, correct_count, wrong_count, accuracy) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        score,
        correctCount,
        wrongCount,
        (correctCount / (correctCount + wrongCount) * 100).toFixed(2)
      ]
    );
    
    console.log('插入成功，ID:', result.insertId);
  } catch (err) {
    console.error('数据库错误:', err);
  } finally {
    // 释放连接回连接池
    if (connection) connection.release();
  }
}

// 测试调用
saveExamResult('user123', 85, 17, 3);