// src/components/TodoList.jsx
import { useState, useMemo } from 'react';
import './TodoList.css';
import React from 'react';

const viewTypeTitles = {
  dayGridDay: '今日待办',
  dayGridWeek: '本周待办',
  dayGridMonth: '本月待办',
  multiMonthYear: '今年待办'
};

function TodoList({ events, viewType, onUpdateEvent, onDeleteEvent, onAddEvent }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 按事件时间升序排序（最近的在前）
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events]);

  // 根据搜索关键词过滤（匹配 title, description, event_time）
  const filteredEvents = useMemo(() => {
    if (!searchKeyword.trim()) return sortedEvents;
    const kw = searchKeyword.toLowerCase();
    return sortedEvents.filter(ev => {
      const titleMatch = ev.title.toLowerCase().includes(kw);
      const descMatch = (ev.description || '').toLowerCase().includes(kw);
      const timeMatch = (ev.event_time || '').includes(kw); // 直接匹配原始时间字符串
      return titleMatch || descMatch || timeMatch;
    });
  }, [sortedEvents, searchKeyword]);

  // 分页
  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // 编辑相关
  const startEdit = (event) => {
    setEditingId(event.id);
    setEditData({
      title: event.title,
      start: event.start?.slice(0, 16),
      description: event.description || '',
    });
  };

  const handleSave = (id) => {
    const original = events.find(e => e.id === id);
    const updated = {
      ...original,
      title: editData.title,
      start: editData.start,
      description: editData.description,
    };
    onUpdateEvent(updated);
    setEditingId(null);
  };

  const handleCancel = () => setEditingId(null);

  // 删除（已有二次确认）
  const handleDelete = (id) => {
    if (window.confirm('确定删除此事件？')) {
      onDeleteEvent(id);
    }
  };

  // 格式化日期时间：2026-05-31T14:30:00 -> 2026年05月31日 14:30
  const formatDateTime = (startStr) => {
    const d = new Date(startStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hour}:${minute}`;
  };

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h3>📋 {viewTypeTitles[viewType] || '待办事项'}</h3>
        {/* 搜索框 + 查询按钮 */}
        <div className="search-group">
          <input
            type="text"
            placeholder="输入要查询的内容（时间/事件/描述）"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1); // 新搜索重置到第一页
            }}
          />
          <button onClick={() => setCurrentPage(1)}>查询</button>
        </div>
        <button className="add-btn" onClick={() => onAddEvent()}>＋ 添加事件</button>
      </div>

      <div className="todo-list">
        {paginatedEvents.length === 0 && <p className="empty-msg">暂无事件</p>}
        {paginatedEvents.map(event => {
          const isEditing = editingId === event.id;
          if (isEditing) {
            return (
              <div key={event.id} className="todo-item editing">
                <div className="edit-form">
                  <input type="datetime-local" value={editData.start} onChange={e => setEditData({ ...editData, start: e.target.value })} />
                  <input placeholder="事件标题" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
                  <input placeholder="备注" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                  <div className="edit-actions">
                    <button onClick={() => handleSave(event.id)}>保存</button>
                    <button onClick={handleCancel}>取消</button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={event.id} className="todo-item">
              <div className="todo-time">{formatDateTime(event.start)}</div>
              <div className="todo-body">
                <div className="todo-title">{event.title}</div>
                <div className="todo-desc">{event.description || '无描述'}</div>
              </div>
              <div className="todo-actions">
                <button onClick={() => startEdit(event)}>✏️</button>
                <button onClick={() => handleDelete(event.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={goPrev} disabled={currentPage === 1}>← 上一页</button>
            <span>第 {currentPage} / {totalPages} 页</span>
            <button onClick={goNext} disabled={currentPage === totalPages}>下一页 →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoList;