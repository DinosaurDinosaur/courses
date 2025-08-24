const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// 資料庫連線配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Juke299vent@',
    database: 'course_selection'
};

// 建立資料庫連線
async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ 成功連接到 MySQL 資料庫。');
        return connection;
    } catch (err) {
        console.error('❌ 連接到 MySQL 資料庫時發生錯誤：', err.message);
        process.exit(1);
    }
}

// 靜態檔案
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 首頁
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 學生資料頁面
app.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'students.html'));
});

// API: 取得所有學生資料
app.get('/api/students', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT student_number, name, major, enrollment_date FROM student ORDER BY enrollment_date DESC'
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error('❌ 從資料庫獲取學生資料時發生錯誤：', err.message);
        res.status(500).send('無法獲取學生選課資料。');
    } finally {
        if (connection) connection.end();
    }
});

// 處理選課提交
app.post('/submit-enrollment', async (req, res) => {
    const { studentName, studentId, selectedCourse } = req.body;

    if (!studentName || !studentId || !selectedCourse) {
        console.error('❌ 資料驗證失敗：姓名、學號或課程為空。');
        return res.status(400).send('請填寫所有必填欄位。');
    }

    let connection;
    try {
        connection = await getConnection();

        const sql = `
            INSERT INTO student (name, student_number, major)
            VALUES (?, ?, ?)
        `;
        const [results] = await connection.execute(sql, [studentName, studentId, selectedCourse]);

        console.log('✅ 選課資料已成功儲存。插入結果:', results);
        res.status(200).send('選課成功！您的資料已提交。');
    } catch (err) {
        console.error('❌ 儲存選課資料時發生錯誤：', err.message);
        res.status(500).send('選課失敗，請稍後再試。');
    } finally {
        if (connection) connection.end();
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`🚀 伺服器正在運行：http://localhost:${port}`);
});
