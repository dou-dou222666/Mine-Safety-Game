const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.'));

app.get('/api/questions', (req, res) => {
  try {
    const questionsData = fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8');
    const questions = JSON.parse(questionsData);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: '读取题目失败' });
  }
});

app.get('/api/questions/:category', (req, res) => {
  try {
    const questionsData = fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8');
    const questions = JSON.parse(questionsData);
    const category = req.params.category;
    
    if (questions[category]) {
      res.json(questions[category]);
    } else {
      res.status(404).json({ error: '未找到该分类题目' });
    }
  } catch (error) {
    res.status(500).json({ error: '读取题目失败' });
  }
});

app.get('/api/random-questions', (req, res) => {
  try {
    const questionsData = fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8');
    const questions = JSON.parse(questionsData);
    const count = parseInt(req.query.count) || 5;
    
    const allQuestions = [];
    Object.keys(questions).forEach(category => {
      questions[category].forEach(q => {
        allQuestions.push({ ...q, category });
      });
    });
    
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    res.json(selected);
  } catch (error) {
    res.status(500).json({ error: '获取随机题目失败' });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const questionsData = fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8');
    const questions = JSON.parse(questionsData);
    const categories = Object.keys(questions);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

module.exports = app;
