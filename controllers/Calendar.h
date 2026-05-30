// controllers/Calendar.h
#pragma once
#include <drogon/HttpSimpleController.h>

class Calendar : public drogon::HttpSimpleController<Calendar> {
public:
    void asyncHandleHttpRequest(const drogon::HttpRequestPtr& req,
                                std::function<void(const drogon::HttpResponsePtr&)>&& callback) override;
    
    PATH_LIST_BEGIN
        PATH_ADD("/events", drogon::Post);
        PATH_ADD("/events", drogon::Get);
        PATH_ADD("/events/{id}", drogon::Delete);
        PATH_ADD("/events/{id}", drogon::Put);
    PATH_LIST_END
    
    // 声明方法
    void addEvent(const drogon::HttpRequestPtr& req,
                  std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    void getEvents(const drogon::HttpRequestPtr& req,
                   std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    void updateEvent(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                     long id);
    void deleteEvent(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                     long id);
};