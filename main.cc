#include <drogon/HttpAppFramework.h>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include "./controllers/Calendar.h"
#include "services/sendMail.h"
#include "services/EventService.h"
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include "controllers/voice.h"

// 解析 "2026-06-01 14:00:00" 格式的时间字符串为 time_t
static time_t parseTimeString(const std::string& timeStr) {
    std::tm tm = {};
    std::istringstream ss(timeStr);
    ss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S");
    return std::mktime(&tm);
}

// 判断是否应该发送提醒（提前 reminderMinutes 分钟）
static bool isTimeToRemind(const std::string& eventTimeStr, int reminderMinutes = 10) {
    time_t eventTime = parseTimeString(eventTimeStr);
    time_t now = std::time(nullptr);
    double diffSec = std::difftime(eventTime, now);
    // 提醒窗口：提前 reminderMinutes 分钟以内，且尚未过期
    return (diffSec <= reminderMinutes * 60 && diffSec > -60); // 过期超过1分钟不再提醒
}



int main()
{
    // 注册根路径处理器
    drogon::app().registerHandler("/",
                                  [](const drogon::HttpRequestPtr &req,
                                     std::function<void(const drogon::HttpResponsePtr &)> &&callback)
                                  {
                                      auto resp = drogon::HttpResponse::newHttpResponse();
                                      resp->setBody("Hello from Drogon! Server works.");
                                      callback(resp);
                                  });
    // 注册另一个测试路由
    drogon::app().registerHandler("/test",
                                  [](const drogon::HttpRequestPtr &req,
                                     std::function<void(const drogon::HttpResponsePtr &)> &&callback)
                                  {
                                      auto resp = drogon::HttpResponse::newHttpResponse();
                                      resp->setBody("Test endpoint works!");
                                      callback(resp);
                                  });
    drogon::app().addListener("0.0.0.0", 7777);
    //创建数据库引擎
    drogon::app().loadConfigFile("config.json");

    //计时器
// 获取主事件循环
auto loop = drogon::app().getLoop();

// 设置定时器，每60秒扫描一次
loop->runEvery(60.0, []() {
    LOG_INFO << "Scanning for upcoming events...";
    
    EventService eventService;
    eventService.getNextUpcomingEvent([](const Json::Value& event) {
        if (event.isNull()) return;
        
        int64_t eventId = event["id"].asInt64();
        std::string eventTime = event["event_time"].asString();
        std::string reminderEmail = event["reminder_email"].asString();
        std::string title = event["title"].asString();
        
        // 判断是否到达提醒时间（提前10分钟）
        if (isTimeToRemind(eventTime, 10)) {
            SendMailService::sendEmailAsync(
                reminderEmail,
                "Reminder: " + title,
                "Your event \"" + title + "\" starts at " + eventTime,
                [eventId](bool mailSent) {
                    if (mailSent) {
                        // 邮件发送成功后，标记事件已提醒
                        EventService().markReminderSent(eventId, [eventId](bool marked) {
                            if (marked) {
                                LOG_INFO << "Reminder marked as sent for event " << eventId;
                            } else {
                                LOG_ERROR << "Failed to mark reminder sent for event " << eventId;
                            }
                        });
                    } else {
                        LOG_ERROR << "Failed to send email for event " << eventId;
                    }
                }
            );
        }
    });
});
    auto voiceCtrl = std::make_shared<voice>();
    drogon::app().registerController(voiceCtrl);
    drogon::app().run();
    return 0;
}