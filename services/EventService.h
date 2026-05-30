// services/EventService.h
#pragma once
#include <json/json.h>
#include <drogon/orm/DbClient.h>
#include <functional>
class EventService {
public:
    EventService();
    
    // 增删查改业务逻辑
    void addEvent(const Json::Value& event, 
                  std::function<void(const Json::Value&)> callback);
    void getEvents(std::function<void(const Json::Value&)> callback);
    void updateEvent(int id, const Json::Value& event,
                     std::function<void(bool success)> callback);
    void deleteEvent(int id, std::function<void(bool success)> callback);
    
    // 新增：获取下一个未提醒的事件
    void getNextUpcomingEvent(std::function<void(const Json::Value&)> callback);
    
    // 新增：标记事件已提醒
    void markReminderSent(int64_t id, std::function<void(bool)> callback);
    
private:
    drogon::orm::DbClientPtr dbClient_;
};