#include "voice.h"
#include "../services/TextProcess.h"
#include "../services/EventService.h"
#include <drogon/drogon.h>

using namespace drogon;

void voice::handleVoice(const HttpRequestPtr& req,
                                   std::function<void(const HttpResponsePtr&)>&& callback) {
    // 1. 解析 JSON 获取文本
    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("text")) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        resp->setBody("{\"error\":\"Missing 'text' field\"}");
        callback(resp);
        return;
    }
    
    std::string userText = (*json)["text"].asString();
    LOG_INFO << "Received voice text: " << userText;
    
    // 2. 调用文本处理服务分析意图
    TextProcessor processor;
    auto command = processor.parseCommand(userText);
    
    // 3. 根据意图调用 EventService 的相应方法
    EventService eventService;
    
    if (command.action == "add") {
        // 添加事件
        Json::Value event;
        event["title"] = command.title;
        event["description"] = command.description;
        event["event_time"] = command.eventTime;
        event["reminder_email"] = command.reminderEmail;
        
        eventService.addEvent(event, [callback](const Json::Value& result) {
            auto resp = HttpResponse::newHttpResponse();
            resp->setBody(result.toStyledString());
            callback(resp);
        });
    }
    else if (command.action == "delete") {
        // 删除事件（按标题删除）
        eventService.deleteEventByTitle(command.title, [callback](bool success, const std::string& msg) {
            Json::Value ret;
            ret["success"] = success;
            ret["message"] = msg;
            auto resp = HttpResponse::newHttpResponse();
            resp->setBody(ret.toStyledString());
            callback(resp);
        });
    }
    else if (command.action == "query") {
        // 查询事件（按时间或标题）
        eventService.queryEvents(command.keyword, command.date, [callback](const Json::Value& events) {
            auto resp = HttpResponse::newHttpResponse();
            resp->setBody(events.toStyledString());
            callback(resp);
        });
    }
    else if (command.action == "update") {
        // 更新事件
        eventService.updateEventByTitle(command.title, command.newTitle, command.newTime, [callback](bool success, const std::string& msg) {
            Json::Value ret;
            ret["success"] = success;
            ret["message"] = msg;
            auto resp = HttpResponse::newHttpResponse();
            resp->setBody(ret.toStyledString());
            callback(resp);
        });
    }
    else {
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody("{\"error\":\"无法理解您的指令\"}");
        callback(resp);
    }
}