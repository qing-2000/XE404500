// services/EventService.cc
#include "EventService.h"
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Exception.h>
#include <drogon/orm/Result.h>
using namespace drogon;
using namespace drogon::orm;

EventService::EventService() {
    dbClient_ = app().getDbClient();
}

void EventService::addEvent(const Json::Value& event,
                            std::function<void(const Json::Value&)> callback) {
    std::string title = event["title"].asString();
    std::string event_time = event["event_time"].asString();
    
    dbClient_->execSqlAsync(
        "INSERT INTO events (title, event_time) VALUES ($1, $2)",
        [callback](const orm::Result& result) {
            Json::Value ret;
            ret["id"] = (int)result.insertId();
            ret["message"] = "success";
            callback(ret);
        },
        [callback](const DrogonDbException& e) {
            Json::Value ret;
            ret["error"] = e.base().what();
            callback(ret);
        },
        title, event_time
    );
}

void EventService::getEvents(std::function<void(const Json::Value&)> callback) {
    dbClient_->execSqlAsync(
        "SELECT id, title, event_time FROM events",
        [callback](const orm::Result& result) {
            Json::Value events(Json::arrayValue);
            for (auto& row : result) {
                Json::Value event;
                event["id"] = row["id"].as<int>();
                event["title"] = row["title"].as<std::string>();
                event["event_time"] = row["event_time"].as<std::string>();
                events.append(event);
            }
            callback(events);
        },
        [callback](const DrogonDbException& e) {
            Json::Value ret;
            ret["error"] = e.base().what();
            callback(ret);
        }
    );
}

void EventService::updateEvent(int id, const Json::Value& event,
                               std::function<void(bool success)> callback) {
    std::string title = event.get("title", "").asString();
    std::string event_time = event.get("event_time", "").asString();
    
    dbClient_->execSqlAsync(
        "UPDATE events SET title = $1, event_time = $2 WHERE id = $3",
        [callback](const Result& result) {
            callback(result.affectedRows() > 0);
        },
        [callback](const DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            callback(false);
        },
        title, event_time, id
    );
}

void EventService::deleteEvent(int id, std::function<void(bool success)> callback) {
    dbClient_->execSqlAsync(
        "DELETE FROM events WHERE id = $1",
        [callback](const Result& result) {
            callback(result.affectedRows() > 0);
        },
        [callback](const DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            callback(false);
        },
        id
    );
}