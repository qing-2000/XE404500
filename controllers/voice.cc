#include "voice.h"
#include "../services/TextProcess.h"
#include "../services/EventService.h"
#include <drogon/drogon.h>

using namespace drogon;

void voice::handleVoice(const HttpRequestPtr &req,
                        std::function<void(const HttpResponsePtr &)> &&callback)
{
    // 1. 解析 JSON 获取文本
    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("text"))
    {
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

    if (command.action == "add")
    {
        Json::Value event;
        event["title"] = command.title;
        event["description"] = command.description;
        event["event_time"] = command.eventTime;
        event["reminder_email"] = command.reminderEmail;
        eventService.addEvent(event, [callback](const Json::Value &result){
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody(result.toStyledString());
        callback(resp); });
    }
    else if (command.action == "delete")
    {
        eventService.deleteEventByTitle(command.title, [callback](bool success, const std::string &msg){
        Json::Value ret;
        ret["success"] = success;
        ret["message"] = msg;
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody(ret.toStyledString());
        callback(resp); });
    }

    else if (command.action == "query")
    {
        eventService.queryEvents(command.keyword, command.date, [callback](const Json::Value &events){
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody(events.toStyledString());
        callback(resp); });
    }
    else if (command.action == "update")
    {
        eventService.updateEventByTitle(command.title, command.newTitle, "", [callback](bool success, const std::string &msg){
        Json::Value ret;
        ret["success"] = success;
        ret["message"] = msg;
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody(ret.toStyledString());
        callback(resp); });
    }
    else
    {
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody("{\"error\":\"无法理解您的指令\"}");
        callback(resp);
    }
}