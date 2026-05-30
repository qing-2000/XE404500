#pragma once
#include <drogon/HttpController.h>

class voice : public drogon::HttpController<voice, false>  // 关键：第二个参数 false
{
public:
    voice() = default;  // 可以接受默认构造
    void handleVoice(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(voice::handleVoice, "/voice", drogon::Post);
    METHOD_LIST_END
};