const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/process', (req, res) => {
    const { name, number, email } = req.body;
    // PDF 생성 및 이메일 전송 로직 추가
    res.send('데이터가 처리되었습니다.');
});

app.listen(3000, () => console.log('서버가 http://localhost:3000 에서 실행 중입니다.'));