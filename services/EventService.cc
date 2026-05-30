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
    LOG_INFO << ">>> NEW VERSION of addEvent is running! <<<";  // 关键日志
    std::string title = event["title"].asString();
    std::string description = event.get("description", "").asString();
    std::string event_time = event["event_time"].asString();
    std::string reminder_email = event.get("reminder_email", "").asString();
    
    dbClient_->execSqlAsync(
        "INSERT INTO events (title, description,event_time,reminder_email) VALUES (?, ?,?,?)",
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
        title,           // 对应 $1
        description,     // 对应 $2
        event_time,      // 对应 $3
        reminder_email   // 对应 $4
    );
}

void EventService::getEvents(std::function<void(const Json::Value&)> callback) {
    dbClient_->execSqlAsync(
        "SELECT id, title, event_time, description FROM events",
        [callback](const orm::Result& result) {
            Json::Value events(Json::arrayValue);
            for (auto& row : result) {
                Json::Value event;
                event["id"] = row["id"].as<int>();
                event["title"] = row["title"].as<std::string>();
                event["description"]=row["description"].as<std::string>();
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

void EventService::updateEvent(
    int id,
    const Json::Value& event,
    std::function<void(bool success)> callback)
{
    // 先查询旧值
    dbClient_->execSqlAsync(
        "SELECT title, description, event_time FROM events WHERE id = ?",
        [this, id, event, callback](const Result& result) {
            if (result.empty()) {
                callback(false);
                return;
            }
            const auto& row = result[0];
            std::string title = row["title"].as<std::string>();
            std::string description = row["description"].as<std::string>();
            std::string event_time = row["event_time"].as<std::string>();
            
            // 部分覆盖
            if (event.isMember("title"))
                title = event["title"].asString();
            if (event.isMember("description"))
                description = event["description"].asString();
            if (event.isMember("event_time"))
                event_time = event["event_time"].asString();
            
            // 执行更新
            dbClient_->execSqlAsync(
                "UPDATE events SET title = ?, description = ?, event_time = ? WHERE id = ?",
                [callback](const Result& res) {
                    callback(res.affectedRows() > 0);
                },
                [callback](const DrogonDbException& e) {
                    LOG_ERROR << e.base().what();
                    callback(false);
                },
                title, description, event_time, id
            );
        },
        [callback](const DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            callback(false);
        },
        id
    );
}

void EventService::deleteEvent(int id, std::function<void(bool success)> callback) {
    LOG_INFO << "delete id=" << id;
    dbClient_->execSqlAsync(
        "DELETE FROM events WHERE id = ?",
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

// services/EventService.cc (添加以下两个函数)

void EventService::getNextUpcomingEvent(std::function<void(const Json::Value&)> callback) {
    // 查询当前时间之后、未提醒的、最早的一个事件
    dbClient_->execSqlAsync(
        "SELECT id, title, description, event_time, reminder_email, reminder_sent "
        "FROM events "
        "WHERE event_time > NOW() AND reminder_sent = 0 "
        "ORDER BY event_time ASC "
        "LIMIT 1",
        [callback](const drogon::orm::Result& result) {
            if (result.empty()) {
                callback(Json::nullValue);  // 没有待提醒事件
                return;
            }
            auto row = result[0];
            Json::Value event;
            event["id"] = row["id"].as<int64_t>();
            event["title"] = row["title"].as<std::string>();
            event["description"] = row["description"].as<std::string>();
            event["event_time"] = row["event_time"].as<std::string>();
            event["reminder_email"] = row["reminder_email"].as<std::string>();
            event["reminder_sent"] = row["reminder_sent"].as<int>();
            callback(event);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            callback(Json::nullValue);
        }
    );
}

void EventService::markReminderSent(int64_t id, std::function<void(bool)> callback) {
    dbClient_->execSqlAsync(
        "UPDATE events SET reminder_sent = 1 WHERE id = ?",
        [callback](const drogon::orm::Result& result) {
            callback(result.affectedRows() > 0);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            callback(false);
        },
        id
    );
}

// services/EventService.cc 中添加

void EventService::deleteEventByTitle(const std::string& title,
                                      std::function<void(bool, const std::string&)> callback) {
    dbClient_->execSqlAsync(
        "DELETE FROM events WHERE title = ?",
        [callback](const drogon::orm::Result& result) {
            if (result.affectedRows() > 0) {
                callback(true, "删除成功");
            } else {
                callback(false, "未找到匹配的事件");
            }
        },
        [callback](const DrogonDbException& e) {
            callback(false, e.base().what());
        },
        title
    );
}

void EventService::queryEvents(const std::string& keyword, const std::string& date,
                               std::function<void(const Json::Value&)> callback) {
    std::string sql;
    if (date == "today") {
        sql = "SELECT id, title, event_time FROM events WHERE DATE(event_time) = CURDATE()";
    } else if (date == "tomorrow") {
        sql = "SELECT id, title, event_time FROM events WHERE DATE(event_time) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";
    } else {
        sql = "SELECT id, title, event_time FROM events WHERE title LIKE ?";
    }
    
    if (date.empty() && !keyword.empty()) {
        std::string likeKeyword = "%" + keyword + "%";
        dbClient_->execSqlAsync(
            sql,
            [callback](const drogon::orm::Result& result) {
                Json::Value events(Json::arrayValue);
                for (auto& row : result) {
                    Json::Value ev;
                    ev["id"] = row["id"].as<int>();
                    ev["title"] = row["title"].as<std::string>();
                    ev["event_time"] = row["event_time"].as<std::string>();
                    events.append(ev);
                }
                callback(events);
            },
            [callback](const DrogonDbException& e) {
                Json::Value ret;
                ret["error"] = e.base().what();
                callback(ret);
            },
            likeKeyword
        );
    } else {
        dbClient_->execSqlAsync(
            sql,
            [callback](const drogon::orm::Result& result) {
                Json::Value events(Json::arrayValue);
                for (auto& row : result) {
                    Json::Value ev;
                    ev["id"] = row["id"].as<int>();
                    ev["title"] = row["title"].as<std::string>();
                    ev["event_time"] = row["event_time"].as<std::string>();
                    events.append(ev);
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
}

void EventService::updateEventByTitle(const std::string& oldTitle,
                                      const std::string& newTitle,
                                      const std::string& newTime,
                                      std::function<void(bool, const std::string&)> callback) {
    dbClient_->execSqlAsync(
        "UPDATE events SET title = ? WHERE title = ?",
        [callback](const drogon::orm::Result& result) {
            if (result.affectedRows() > 0) {
                callback(true, "更新成功");
            } else {
                callback(false, "未找到匹配的事件");
            }
        },
        [callback](const DrogonDbException& e) {
            callback(false, e.base().what());
        },
        newTitle, oldTitle
    );
}
