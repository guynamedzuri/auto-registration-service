require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs'); // 파일 시스템 모듈
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/process', (req, res) => {
    const { name, number, email } = req.body;

    // 1. 입력받은 데이터를 '/'로 구분하여 문자열 생성
    const dataString = `${name}/${number}/${email}\n`;

    // 2. 데이터를 txt 파일로 저장
    const filePath = './user_data.txt';
    fs.writeFile(filePath, dataString, (err) => {
        if (err) {
            console.error('파일 저장 실패:', err);
            return res.status(500).send('파일 저장에 실패했습니다.');
        }

        console.log('데이터가 파일에 저장되었습니다.');

        // 3. SMTP 설정
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 4. EMAIL_USER에게 txt 파일 전송
        const mailToUser = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // EMAIL_USER에게 전송
            subject: '신규 근로계약서 데이터',
            text: `새로운 근로계약서 데이터가 접수되었습니다.\n\n첨부된 파일을 확인하세요.`,
            attachments: [
                {
                    filename: 'user_data.txt',
                    path: filePath, // 첨부할 txt 파일 경로
                },
            ],
        };

        // 5. 입력받은 email에게 텍스트 이메일 전송
        const mailToClient = {
            from: process.env.EMAIL_USER,
            to: email, // 입력받은 email로 전송
            subject: '근로계약서 접수 완료',
            text: `안녕하세요, ${name}님. 근로계약서가 성공적으로 접수되었습니다.`,
        };

        // 6. EMAIL_USER에게 이메일 전송
        transporter.sendMail(mailToUser, (error, info) => {
            if (error) {
                console.error('EMAIL_USER 전송 실패:', error);
            } else {
                console.log('EMAIL_USER 전송 성공:', info.response);
            }

            // 파일 삭제
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('파일 삭제 실패:', unlinkErr);
                } else {
                    console.log('파일이 성공적으로 삭제되었습니다.');
                }
            });
        });

        // 7. 입력받은 email에게 이메일 전송
        transporter.sendMail(mailToClient, (error, info) => {
            if (error) {
                console.error('사용자 이메일 전송 실패:', error);
                return res.status(500).send('사용자 이메일 전송에 실패했습니다.');
            }

            console.log('사용자 이메일 전송 성공:', info.response);
            res.send('EMAIL_USER와 사용자에게 이메일이 성공적으로 전송되었습니다.');
        });
    });
});

app.listen(3000, () => console.log('서버가 http://localhost:3000 에서 실행 중입니다.'));