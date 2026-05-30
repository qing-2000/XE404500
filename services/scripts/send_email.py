#!/usr/bin/env python3
import smtplib, sys, json, os
from email.mime.text import MIMEText
from email.header import Header

def load_smtp_config():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 从 services/scripts/ 向上两级到 base/，然后进入 build/
    config_path = os.path.join(script_dir, "..", "..", "build", "config.json")
    config_path = os.path.abspath(config_path)   # 规范化路径
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        smtp_cfg = config.get("smtp", {})
        return (
            smtp_cfg.get("server", "smtp.qq.com"),
            smtp_cfg.get("port", 465),
            smtp_cfg.get("email", ""),
            smtp_cfg.get("auth_code", "")
        )
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"读取配置文件失败: {e}"}))
        sys.exit(1)

def send_mail(recipient, subject, body):
    smtp_server, smtp_port, sender_email, auth_code = load_smtp_config()
    if not sender_email or not auth_code:
        print(json.dumps({"status": "error", "message": "邮箱或授权码未配置"}))
        return

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = sender_email
    msg["To"] = recipient

    try:
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(sender_email, auth_code)
            server.send_message(msg)
        print(json.dumps({"status": "success"}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({"status": "error", "message": "参数错误"}))
        sys.exit(1)
    send_mail(sys.argv[1], sys.argv[2], sys.argv[3])