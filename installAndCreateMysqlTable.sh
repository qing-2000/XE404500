#!/bin/bash

# 安装 MySQL
sudo apt update
sudo apt install mysql-server -y

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 创建数据库和表
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS calendar_db;
USE calendar_db;

-- 删除旧表（如果存在，避免字段冲突）
DROP TABLE IF EXISTS events;

-- 创建新表
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    event_time TIMESTAMP NOT NULL,
    reminder_email VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     reminder_sent  TINYINT DEFAULT 0
);

SHOW TABLES;

-- 插入测试数据
INSERT INTO events (title, description, event_time, reminder_email) 
VALUES ('测试事件', '验证 start_time 自动填充', '2026-06-01 10:00:00', 'test@example.com');

-- 查看插入结果（注意字段名是 start_time，不是 starttime）
SELECT id, title, start_time, created_at, event_time FROM events;

EOF

echo "MySQL 安装和数据库创建完成！"