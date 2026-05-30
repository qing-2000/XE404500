curl -X PUT "http://localhost:7777/events?id=8" \
  -H "Content-Type: application/json" \
  -d '{"title":"仅更新标题"}'    title,description,event_time均可

 curl -v -X DELETE "http://localhost:7777/events?id=2"

 curl http://localhost:7777/events(get)

 curl -X POST http://localhost:7777/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "团队周会",
    "description": "讨论项目进度",
    "event_time": "2026-06-01 14:30:00",
    "reminder_email": "your@qq.com"
  }'



