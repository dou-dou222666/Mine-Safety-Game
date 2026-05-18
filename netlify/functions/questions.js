const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    const questionsPath = path.join(__dirname, '..', '..', 'public', 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '读取题目失败' })
    };
  }
};
