#include <drogon/HttpAppFramework.h>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include "./controllers/Calendar.h"
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
    // Set HTTP listener address and port
    drogon::app().addListener("0.0.0.0", 7777);
    // Load config file
    // drogon::app().loadConfigFile("../config.json");
    // Run HTTP framework,the method will block in the internal event loop
    drogon::app().run();
    return 0;
}