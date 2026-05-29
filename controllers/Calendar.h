#pragma once
#include <drogon/HttpSimpleController.h>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
using namespace drogon;

class Calendar : public drogon::HttpSimpleController<Calendar>
{
  public:
    void asyncHandleHttpRequest(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback) override;
    PATH_LIST_BEGIN
    // list path definitions here;
    // PATH_ADD("/path", "filter1", "filter2", HttpMethod1, HttpMethod2...);
    PATH_ADD("/events", Post);    // POST /events
    PATH_ADD("/events", Get);     // GET /events  
    PATH_ADD("/events/{id}", Delete);  // DELETE /events/123
    PATH_ADD("/events/{id}", Put);     // PUT /events/123
    PATH_LIST_END
        
    // 声明辅助函数（可选）
    void getEvents(const drogon::HttpRequestPtr& req,
                   std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    void addEvent(const drogon::HttpRequestPtr& req,
                  std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    void deleteEvent(const drogon::HttpRequestPtr& req,
                  std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    void updateEvent(const drogon::HttpRequestPtr& req,
                  std::function<void(const drogon::HttpResponsePtr&)>&& callback);
};
