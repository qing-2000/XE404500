// controllers/Calendar.cc
#include "Calendar.h"
#include "../services/EventService.h"
#include <drogon/drogon.h>

using namespace drogon;

void Calendar::asyncHandleHttpRequest(const HttpRequestPtr& req,std::function<void(const HttpResponsePtr&)>&& callback) {
    //打印路径
    LOG_INFO << "Request: " << req->methodString() << " " << req->path();

    if (req->method() == Post && req->path() == "/events") {
        addEvent(req, std::move(callback));
    }
    else if (req->method() == Get && req->path() == "/events") {
        getEvents(req, std::move(callback));
    }
    else if (req->method() == Delete) {
       auto idStr = req->getParameter("id");
       LOG_INFO << "delete id=" << idStr;
       auto id = std::stoll(idStr);
       deleteEvent(req, std::move(callback), id);
    }
    else if (req->method() == Put) {
    auto idStr = req->getParameter("id");

    if(idStr.empty())
    {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto id = std::stoll(idStr);

    updateEvent(req, std::move(callback), id);
    }
    else {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k404NotFound);
        callback(resp);
    }
}

void Calendar::addEvent(const HttpRequestPtr& req,
                        std::function<void(const HttpResponsePtr&)>&& callback) {
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }
    
    EventService service;
    service.addEvent(*json, [callback](const Json::Value& result) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody(result.toStyledString());
        callback(resp);
    });
}

void Calendar::getEvents(const HttpRequestPtr& req,
                         std::function<void(const HttpResponsePtr&)>&& callback) {
    EventService service;
    service.getEvents([callback](const Json::Value& result) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody(result.toStyledString());
        callback(resp);
    });
}

void Calendar::updateEvent(const HttpRequestPtr& req,
                           std::function<void(const HttpResponsePtr&)>&& callback,
                           long id) {
    LOG_INFO << "Updating event ID: " << id;
    auto json = req->getJsonObject();
    if (json) {
        LOG_INFO << "Update data: " << json->toStyledString();
    } else {
        LOG_INFO << "No JSON body";
    }
    
    EventService service;
    service.updateEvent(id, *json, [callback](bool success) {
        auto resp = HttpResponse::newHttpResponse();
        if (success) {
            resp->setBody("{\"message\":\"updated\"}");
        } else {
            resp->setStatusCode(k404NotFound);
            resp->setBody("{\"error\":\"event not found\"}");
        }
        callback(resp);
    });
}

void Calendar::deleteEvent(const HttpRequestPtr& req,std::function<void(const HttpResponsePtr&)>&& callback,long id) {
    EventService service;
    service.deleteEvent(id, [callback](bool success) {
        auto resp = HttpResponse::newHttpResponse();
        if (success) {
            resp->setBody("{\"message\":\"deleted\"}");
        } else {
            resp->setStatusCode(k404NotFound);
            resp->setBody("{\"error\":\"event not found\"}");
        }
        callback(resp);
    });
}