#include "Calendar.h"
#include <drogon/drogon.h>

using namespace drogon;

void Calendar::asyncHandleHttpRequest(const HttpRequestPtr& req,
                                      std::function<void(const HttpResponsePtr&)>&& callback) {
    if (req->method() == Post && req->path() == "/events") {
        addEvent(req, std::move(callback));
    }
    else if (req->method() == Get && req->path() == "/events") {
        getEvents(req, std::move(callback));
    }
    else if (req->method() == Delete && req->path().find("/events/") == 0) {
        deleteEvent(req, std::move(callback));
    }
    else if (req->method() == Put && req->path().find("/events/") == 0) {
        updateEvent(req, std::move(callback));
    }
    else {
        // ✅ 正确：不带参数
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k404NotFound);  // 单独设置状态码
        resp->setBody("Route not found");
        callback(resp);
    }
}

void Calendar::addEvent(const HttpRequestPtr& req,
                        std::function<void(const HttpResponsePtr&)>&& callback) {
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);  // 单独设置状态码
        resp->setBody("Bad Request");
        callback(resp);
        return;
    }
    
    auto resp = HttpResponse::newHttpResponse();
    resp->setBody("Event added successfully");
    callback(resp);
}

void Calendar::getEvents(const HttpRequestPtr& req,
                         std::function<void(const HttpResponsePtr&)>&& callback) {
    auto resp = HttpResponse::newHttpResponse();
    resp->setBody("Returning events list");
    callback(resp);
}

void Calendar::deleteEvent(const HttpRequestPtr& req,
                           std::function<void(const HttpResponsePtr&)>&& callback) {
    auto path = req->path();
    auto id = path.substr(path.find_last_of('/') + 1);
    
    auto resp = HttpResponse::newHttpResponse();
    resp->setBody("Deleted event with id: " + id);
    callback(resp);
}

void Calendar::updateEvent(const HttpRequestPtr& req,
                           std::function<void(const HttpResponsePtr&)>&& callback) {
    auto path = req->path();
    auto id = path.substr(path.find_last_of('/') + 1);
    
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }
    
    auto resp = HttpResponse::newHttpResponse();
    resp->setBody("Updated event with id: " + id);
    callback(resp);
}