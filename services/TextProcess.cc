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
    // 正则：匹配 年.月.日,时,分 然后空格 标题（必填） 空格 描述（可选）
    // 例如：2026.05.31,15,00 产品评审会议 讨论架构
    std::regex structRegex(R"((\d{4})\.(\d{1,2})\.(\d{1,2}),(\d{1,2}),(\d{1,2})\s+([^\s]+)(?:\s+(.+))?)");
    std::smatch match;
    if (std::regex_search(text, match, structRegex)) {
        std::string year = match[1].str();
        std::string month = match[2].str();
        std::string day = match[3].str();
        std::string hour = match[4].str();
        std::string minute = match[5].str();
        cmd.title = match[6].str();          // 标题（第一个词）
        cmd.description = match[7].str();    // 描述（剩余部分，可能为空）
        
        // 格式化为 MySQL TIMESTAMP 格式
        cmd.eventTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":00";
    } else {
        // 若格式不符，返回错误指令
        cmd.action = "unknown";
        cmd.title = "无法解析，请使用格式: 年.月.日,时,分 标题 描述";
    }
    
    // 默认邮箱（可从配置读取）
    cmd.reminderEmail = "1994665145@qq.com";
    return cmd;
}

Command TextProcessor::parseDelete(const std::string& text) {
    Command cmd;
    cmd.action = "delete";
    std::regex delRegex(R"(删除\s+(.+))");
    std::smatch match;
    if (std::regex_search(text, match, delRegex)) {
        cmd.title = match[1].str();
    } else {
        cmd.action = "unknown";
    }
    return cmd;
}

Command TextProcessor::parseQuery(const std::string& text) {
    Command cmd;
    cmd.action = "query";
    std::regex dateRegex(R"(查询\s+(\d{4}\.\d{1,2}\.\d{1,2}))");
    std::smatch match;
    if (std::regex_search(text, match, dateRegex)) {
        cmd.date = match[1].str();  // 例如 "2026.05.31"
    } else {
        // 按标题模糊查询
        std::regex titleRegex(R"(查询\s+(.+))");
        if (std::regex_search(text, match, titleRegex)) {
            cmd.keyword = match[1].str();
        } else {
            cmd.action = "unknown";
        }
    }
    return cmd;
}

Command TextProcessor::parseUpdate(const std::string& text) {
    Command cmd;
    cmd.action = "update";
    std::regex updateRegex(R"(更新\s+(\S+)\s+(\S+))");
    std::smatch match;
    if (std::regex_search(text, match, updateRegex)) {
        cmd.title = match[1].str();      // 原标题
        cmd.newTitle = match[2].str();   // 新标题
    } else {
        cmd.action = "unknown";
    }
    return cmd;
}