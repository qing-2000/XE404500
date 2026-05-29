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
    
private:
    drogon::orm::DbClientPtr dbClient_;
};