const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    const questionsPath = path.join(__dirname, '..', '..', 'public', 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);
    const params = event.queryStringParameters || {};
    const count = parseInt(params.count) || 5;
    const allQuestions = [];
    Object.keys(questions).forEach(category => {
      questions[category].forEach(q => { allQuestions.push({ ...q, category }); });
    });
    const selected = allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selected) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: '获取随机题目失败' }) };
  }
};
