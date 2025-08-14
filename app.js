const express = require('express');
const mysql = require('mysql2/promise'); // 使用 mysql2 的 Promise 版本，讓非同步操作更簡潔
const path = require('path');
const bodyParser = require('body-parser'); // 用於解析 POST 請求的 Body 數據

const app = express();
const port = 3000; // 伺服器將在 3000 埠運行

// --- 資料庫連接配置 ---
// (Database Connection Configuration)
// **重要：請務必將 'your_secure_password' 替換為您在 MySQL 中設定的實際密碼！**
const dbConfig = {
    host: 'localhost', // 資料庫主機位址，通常為本機
    user: 'root', // 您用於連接資料庫的 MySQL 用戶名 (或 'root')
    password: 'Juke299vent@', // 該用戶的密碼
    database: 'course_selection' // 您在 Workbench 中創建的資料庫名稱
};

// 建立資料庫連接
async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ 成功連接到 MySQL 資料庫。'); // 連接成功訊息
        return connection;
    } catch (err) {
        console.error('❌ 連接到 MySQL 資料庫時發生錯誤：', err.message); // 連接失敗訊息
        process.exit(1); // 連接失敗時，退出 Node.js 應用程式
    }
}

// 設定靜態檔案目錄：讓瀏覽器可以讀取前端的 HTML, CSS, JavaScript 等檔案
// (Set up static files directory)
app.use(express.static(path.join(__dirname, 'public')));

// 使用 body-parser 中介軟體來解析 POST 請求的數據：
// - urlencoded: 處理 HTML 表單提交的數據 (如您上次提供的舊版 app.js 中使用的方法)
// - json: 處理透過 JavaScript (如 fetch API) 發送的 JSON 數據
app.use(bodyParser.urlencoded({ extended: true })); // 為了兼容性，建議保留
app.use(bodyParser.json());

// --- 路由設定 ---
// (Route Definitions)

// 首頁路由：當用戶訪問根路徑 (/) 時，發送 `index.html` 檔案
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// app.js (新增內容)

// 路由：當用戶訪問 /students 時，發送 students.html 檔案
app.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'students.html'));
});

// API 路由：從資料庫獲取所有學生選課資料
app.get('/api/students', async (req, res) => {
    let connection;
    try {
        connection = await getConnection(); // 獲取資料庫連接
        // 查詢所有學生的姓名、選修課程和選課日期
        const [rows] = await connection.execute('SELECT name, major, enrollment_date FROM student ORDER BY enrollment_date DESC');
        
        // 將查詢結果以 JSON 格式發送回前端
        res.status(200).json(rows);
    } catch (err) {
        console.error('❌ 從資料庫獲取學生資料時發生錯誤：', err.message);
        res.status(500).send('無法獲取學生選課資料。');
    } finally {
        if (connection) {
            connection.end(); // 關閉資料庫連接
        }
    }
});


// 處理選課表單提交的 POST 請求
app.post('/submit-enrollment', async (req, res) => {
    // 從前端請求的 Body 中解構出 `studentName` 和 `selectedCourse`
    // 這些會對應到資料庫中的 `name` 和 `major` 欄位
    const { studentName, selectedCourse } = req.body;

    // 簡單的資料驗證：檢查姓名和課程是否為空
    if (!studentName || !selectedCourse) {
        console.error('❌ 資料驗證失敗：學生姓名或選擇課程為空。'); // 更詳細的日誌
        return res.status(400).send('請填寫所有必填欄位。'); // 返回 400 錯誤碼 (Bad Request)
    }

    let connection; // 宣告一個變數來儲存資料庫連接
    try {
        connection = await getConnection(); // 獲取資料庫連接

        // SQL 插入語句：將數據插入到 `student` 表格的 `name` 和 `major` 欄位
        // `student_id` 和 `enrollment_date` 會由 MySQL 自動處理 (AUTO_INCREMENT 和 CURRENT_TIMESTAMP)
        const sql = `
            INSERT INTO student (name, major)
            VALUES (?, ?)
        `;
        
        // 執行 SQL 語句。使用 `connection.execute` 可以自動處理參數的防 SQL 注入。
        const [results] = await connection.execute(sql, [studentName, selectedCourse]);
        console.log('✅ 選課資料已成功儲存。插入結果:', results); // 儲存成功訊息
        res.status(200).send('選課成功！您的資料已提交。'); // 返回 200 成功碼
    } catch (err) {
        console.error('❌ 儲存選課資料時發生錯誤：', err.message); // 儲存失敗訊息
        res.status(500).send('選課失敗，請稍後再試。'); // 返回 500 錯誤碼 (Internal Server Error)
    } finally {
        // 無論成功或失敗，最後都要關閉資料庫連接
        if (connection) {
            connection.end(); 
        }
    }
});

// --- 啟動伺服器 ---
// (Start the Server)
app.listen(port, () => {
    console.log(`🚀 伺服器正在運行：http://localhost:${port}`);
});