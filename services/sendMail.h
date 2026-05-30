// services/SendMailService.h
#pragma once
#include <functional>
#include <string>

class SendMailService {
public:
    static void sendEmailAsync(const std::string& to, const std::string& title, 
                               const std::string& content, 
                               std::function<void(bool)> callback = nullptr);
};