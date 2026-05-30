// services/sendMail.cc
#include "sendMail.h"
#include <drogon/drogon.h>
#include <cstdlib>
#include <sstream>
#include <future>
#include <array>
#include <memory>

//  正确写法

static const std::string PYTHON_SCRIPT_PATH ="../services/scripts/send_email.py";

void SendMailService::sendEmailAsync(const std::string& to, const std::string& title, 
                                     const std::string& content,
                                     std::function<void(bool)> callback) {
    // 使用 std::async 在单独的线程中执行，不阻塞事件循环
    auto future = std::async(std::launch::async, [to, title, content, callback]() {
        // 构造命令（注意对特殊字符进行转义，这里简化）
        std::string cmd = "python3 \"" + PYTHON_SCRIPT_PATH + "\" \"" + to + 
                          "\" \"" + title + "\" \"" + content + "\"";
        
        std::array<char, 128> buffer;
        std::string result;
        std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd.c_str(), "r"), pclose);
        if (!pipe) {
            if (callback) callback(false);
            return;
        }
        while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
            result += buffer.data();
        }
        bool success = (result.find("\"status\": \"success\"") != std::string::npos);
        if (callback) callback(success);
    });
}