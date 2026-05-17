const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
    const questionsPath = path.join(__dirname, '..', '..', 'public', 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);
    const categories = Object.keys(questions);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '获取分类失败' })
    };
  }
};
