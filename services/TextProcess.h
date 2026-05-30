// services/TextProcess.h
#pragma once
#include <string>
#include <regex>
#include <vector>

struct Command {
    std::string action;      // add, delete, query, update
    std::string title;
    std::string description;
    std::string eventTime;
    std::string reminderEmail;
    std::string keyword;     // 用于查询
    std::string date;        // 用于查询
    std::string newTitle;    // 用于更新
    std::string newTime;     // 用于更新
};

class TextProcessor {
public:
    Command parseCommand(const std::string& text);
    
private:
    std::string extractTime(const std::string& text);
    std::string extractTitle(const std::string& text);
    Command parseAdd(const std::string& text);
    Command parseDelete(const std::string& text);
    Command parseQuery(const std::string& text);
    Command parseUpdate(const std::string& text);
};