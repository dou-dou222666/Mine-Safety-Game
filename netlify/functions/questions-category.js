const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    const questionsPath = path.join(__dirname, '..', '..', 'public', 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);

    // Extract category from path: /api/questions/:category
    const segments = event.path.split('/');
    const category = decodeURIComponent(segments[segments.length - 1]);

    if (questions[category]) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions[category])
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '未找到该分类题目' })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '读取题目失败' })
    };
  }
};
