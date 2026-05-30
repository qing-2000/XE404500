cmake_minimum_required(VERSION 3.10)  # 建议至少 3.10
project(base CXX)

# C++ 标准检测
include(CheckIncludeFileCXX)
check_include_file_cxx(any HAS_ANY)
check_include_file_cxx(string_view HAS_STRING_VIEW)
check_include_file_cxx(coroutine HAS_COROUTINE)

if (NOT "${CMAKE_CXX_STANDARD}" STREQUAL "")
    # Do nothing
elseif (HAS_ANY AND HAS_STRING_VIEW AND HAS_COROUTINE)
    set(CMAKE_CXX_STANDARD 20)
elseif (HAS_ANY AND HAS_STRING_VIEW)
    set(CMAKE_CXX_STANDARD 17)
else ()
    set(CMAKE_CXX_STANDARD 14)
endif ()

set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 禁用 PIE 避免链接警告（可选）
set(CMAKE_POSITION_INDEPENDENT_CODE OFF)

# 查找依赖
find_package(Drogon CONFIG REQUIRED)
find_package(Threads REQUIRED)

# 查找 MySQL/MariaDB 客户端库
find_library(MYSQL_LIB NAMES mariadb mysqlclient)
if(NOT MYSQL_LIB)
    message(FATAL_ERROR "MySQL/MariaDB client library not found")
endif()

# 源文件列表（只在这里添加一次）
set(SOURCES
    main.cc
    controllers/Calendar.cc
    controllers/voice.cc
    services/EventService.cc
    services/sendMail.cc
    services/TextProcess.cc
)

# 创建可执行文件
add_executable(${PROJECT_NAME} ${SOURCES})

# 链接库
target_link_libraries(${PROJECT_NAME} PRIVATE
    Drogon::Drogon
    ${MYSQL_LIB}
    Threads::Threads
)

# 包含目录
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/controllers
    ${CMAKE_CURRENT_SOURCE_DIR}/services
)

# 输出 C++ 标准信息
if (CMAKE_CXX_STANDARD LESS 17)
    message(FATAL_ERROR "c++17 or higher is required")
elseif (CMAKE_CXX_STANDARD LESS 20)
    message(STATUS "use c++17")
else ()
    message(STATUS "use c++20")
endif ()

# 如果有测试目录，取消下一行注释
# add_subdirectory(test)