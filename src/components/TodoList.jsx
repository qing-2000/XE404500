import { useState } from 'react';
import { parseTextToEvent } from '../utils/parseText';
import './TodoList.css';

function TodoList({ events, onUpdateEvent, onDeleteEvent, onAddEvent }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [textInput, setTextInput] = useState('');

  const startEdit = (event) => {
    setEditingId(event.id);
    setEditData({
      title: event.title,
      start: event.start?.slice(0, 16), // yyyy-MM-ddThh:mm
      location: event.extendedProps?.location || '',
      locationUrl: event.extendedProps?.locationUrl || '',
      person: event.extendedProps?.person || '',
      description: event.extendedProps?.description || ''
    });
  };

  const handleSave = (id) => {
    const updated = {
      ...events.find(e => e.id === id),
      title: editData.title,
      start: editData.start,
      extendedProps: {
        location: editData.location,
        locationUrl: editData.locationUrl,
        person: editData.person,
        description: editData.description
      }
    };
    onUpdateEvent(updated);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('确定删除此事件？')) {
      onDeleteEvent(id);
    }
  };

  const handleTextAdd = () => {
    const parsed = parseTextToEvent(textInput);
    if (parsed) {
      onAddEvent({ ...parsed, id: String(Date.now()) });
      setTextInput('');
    } else {
      alert('无法解析输入，请重试');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleTextAdd();
  };

  const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h3>📋 当月待办事项</h3>
        {/* 文本输入区域 */}
        <div className="text-add-group">
          <input
            type="text"
            placeholder="输入如：明天下午三点开会"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleTextAdd} className="send-btn">发送</button>
        </div>
        <button className="add-btn" onClick={() => onAddEvent()}>＋ 添加事件</button>
      </div>
      <div className="todo-list">
        {sorted.length === 0 && <p className="empty-msg">暂无事件</p>}
        {sorted.map(event => {
          const isEditing = editingId === event.id;
          const start = new Date(event.start);
          const timeStr = start.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          const dateStr = `${start.getMonth() + 1}月${start.getDate()}日`;

          if (isEditing) {
            return (
              <div key={event.id} className="todo-item editing">
                <div className="edit-form">
                  <input
                    type="datetime-local"
                    value={editData.start}
                    onChange={e => setEditData({ ...editData, start: e.target.value })}
                  />
                  <input
                    placeholder="事件标题"
                    value={editData.title}
                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                  />
                  <input
                    placeholder="地点名称"
                    value={editData.location}
                    onChange={e => setEditData({ ...editData, location: e.target.value })}
                  />
                  <input
                    placeholder="地图链接（可选）"
                    value={editData.locationUrl}
                    onChange={e => setEditData({ ...editData, locationUrl: e.target.value })}
                  />
                  <input
                    placeholder="人物"
                    value={editData.person}
                    onChange={e => setEditData({ ...editData, person: e.target.value })}
                  />
                  <input
                    placeholder="备注"
                    value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                  />
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
              <div className="todo-time">{dateStr} {timeStr}</div>
              <div className="todo-body">
                <div className="todo-title">{event.title}</div>
                <div className="todo-details">
                  {event.extendedProps?.location && (
                    <span className="todo-location">
                      📍
                      {event.extendedProps.locationUrl ? (
                        <a href={event.extendedProps.locationUrl} target="_blank" rel="noreferrer">
                          {event.extendedProps.location}
                        </a>
                      ) : (
                        event.extendedProps.location
                      )}
                    </span>
                  )}
                  {event.extendedProps?.person && (
                    <span className="todo-person"> 👤 {event.extendedProps.person}</span>
                  )}
                  {event.extendedProps?.description && (
                    <span className="todo-desc"> 📝 {event.extendedProps.description}</span>
                  )}
                </div>
              </div>
              <div className="todo-actions">
                <button onClick={() => startEdit(event)}>✏️</button>
                <button onClick={() => handleDelete(event.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TodoList;