// services/TextProcess.cc
#include "TextProcess.h"
#include <regex>
#include <iostream>

Command TextProcessor::parseCommand(const std::string& text) {
    // 识别意图关键词
    if (text.find("添加") != std::string::npos || 
        text.find("增加") != std::string::npos ||
        text.find("新建") != std::string::npos) {
        return parseAdd(text);
    }
    else if (text.find("删除") != std::string::npos || 
             text.find("移除") != std::string::npos) {
        return parseDelete(text);
    }
    else if (text.find("查询") != std::string::npos || 
             text.find("查看") != std::string::npos ||
             text.find("有哪些") != std::string::npos ||
             text.find("什么") != std::string::npos) {
        return parseQuery(text);
    }
    else if (text.find("修改") != std::string::npos || 
             text.find("更新") != std::string::npos ||
             text.find("改为") != std::string::npos) {
        return parseUpdate(text);
    }
    else {
        Command cmd;
        cmd.action = "unknown";
        return cmd;
    }
}

Command TextProcessor::parseAdd(const std::string& text) {
    Command cmd;
    cmd.action = "add";
    
    // 提取时间（简单模式：匹配类似 "明天下午3点"、"6月1日10点" 等）
    // 这里简化处理，实际需要更复杂的 NLP 或时间解析库
    std::regex timeRegex(R"((\d{1,2})月(\d{1,2})日(\d{1,2})点(\d{0,2})?)");
    std::smatch match;
    if (std::regex_search(text, match, timeRegex)) {
        std::string month = match[1];
        std::string day = match[2];
        std::string hour = match[3];
        std::string minute = match[4].length() ? match[4].str() : "00";
        cmd.eventTime = "2026-" + month + "-" + day + " " + hour + ":" + minute + ":00";
    } else {
        // 默认时间：明天上午10点
        cmd.eventTime = "2026-06-01 10:00:00";
    }
    
    // 提取标题（"添加...的会议" 等模式）
    std::regex titleRegex(R"(添加(.*?)(?:的会议|的活动|的任务|$))");
    if (std::regex_search(text, match, titleRegex)) {
        cmd.title = match[1];
    } else if (text.length() > 10) {
        cmd.title = text.substr(0, 20);  // 取前20字作为标题
    }
    
    // 设置默认邮箱（可从配置读取）
    cmd.reminderEmail = "1994665145@qq.com";
    
    return cmd;
}

Command TextProcessor::parseDelete(const std::string& text) {
    Command cmd;
    cmd.action = "delete";
    
    // 提取要删除的事件标题
    std::regex titleRegex(R"(删除(.*?)(?:的会议|的活动|的任务|$))");
    std::smatch match;
    if (std::regex_search(text, match, titleRegex)) {
        cmd.title = match[1];
    } else {
        cmd.title = text.substr(6);  // 去掉"删除"二字
    }
    
    return cmd;
}

Command TextProcessor::parseQuery(const std::string& text) {
    Command cmd;
    cmd.action = "query";
    
    // 判断查询类型
    if (text.find("今天") != std::string::npos) {
        cmd.date = "today";
        cmd.keyword = "";
    } else if (text.find("明天") != std::string::npos) {
        cmd.date = "tomorrow";
        cmd.keyword = "";
    } else {
        // 按关键词查询
        cmd.keyword = text;
        cmd.date = "";
    }
    
    return cmd;
}

Command TextProcessor::parseUpdate(const std::string& text) {
    Command cmd;
    cmd.action = "update";
    
    // 提取原标题和新标题
    std::regex updateRegex(R"(把(.*?)改为(.*?)(?:的会议|$))");
    std::smatch match;
    if (std::regex_search(text, match, updateRegex)) {
        cmd.title = match[1];
        cmd.newTitle = match[2];
    }
    
    return cmd;
}