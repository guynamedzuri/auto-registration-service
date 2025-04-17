require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/process', (req, res) => {
    const { name, number, email } = req.body;

    // SMTP 설정
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // 회사 SMTP 서버
        port: process.env.SMTP_PORT, // 회사 SMTP 포트
        secure: process.env.SMTP_SECURE === 'true', // TLS/SSL 여부
        auth: {
            user: process.env.EMAIL_USER, // 회사 이메일 계정
            pass: process.env.EMAIL_PASS, // 회사 이메일 비밀번호
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '근로계약서',
        text: `안녕하세요, ${name}님. 근로계약서가 준비되었습니다.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('이메일 전송 실패:', error);
            res.status(500).send('이메일 전송에 실패했습니다.');
        } else {
            console.log('이메일 전송 성공:', info.response);
            res.send('이메일이 성공적으로 전송되었습니다.');
        }
    });
});

app.listen(3000, () => console.log('서버가 http://localhost:3000 에서 실행 중입니다.'));