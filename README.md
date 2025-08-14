``` CREATE TABLE `student`(
   `student_id` INT AUTO_INCREMENT PRIMARY KEY,
   `name` VARCHAR(20),
   `major` VARCHAR(20)
);  ```

### 先在 MySQL 的 MySQL Workbench 上   建造一個資料庫
### 接著 打開該資料庫
### 在該資料庫裡寫MySQL的語法

#### USE course_selection; -- 確保您已選取正確的資料庫
#### DESCRIBE student; -- 可以確認目前table student 有哪些欄位

#### ALTER TABLE student -- 告訴 MySQL 您要修改 student 表格
#### ADD COLUMN enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;新增一個名為 enrollment_date 的欄位
#### TIMESTAMP: 是一種日期時間型別
#### DEFAULT CURRENT_TIMESTAMP: 設定該欄位的預設值為當前的日期和時間。這表示當您插入新資料時，如果沒有明確為 enrollment_date 提供值，MySQL 會自動填入當前的時間


