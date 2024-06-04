const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 使用cors中间件
app.use(cors());

// 中间件
app.use(bodyParser.json());

// 临时数据存储（可以替换为数据库）
const dataFilePath = path.join(__dirname, 'data.json');

// 确保数据文件存在
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

// 获取所有提交的数据
app.get('/submissions', (req, res) => {
  fs.readFile(dataFilePath, (err, data) => {
    if (err) {
      return res.status(500).json({ error: '无法读取数据文件' });
    }
    res.json(JSON.parse(data));
  });
});

// 提交新的数据
app.post('/submit', (req, res) => {
  const newSubmission = req.body;

  // 读取现有数据
  fs.readFile(dataFilePath, (err, data) => {
    if (err) {
      return res.status(500).json({ error: '无法读取数据文件' });
    }

    // 解析现有数据并添加新数据
    const submissions = JSON.parse(data);
    submissions.push(newSubmission);

    // 写入更新的数据
    fs.writeFile(dataFilePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: '无法写入数据文件' });
      }

      res.json({ code: 0, message: '提交成功' });
    });
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
