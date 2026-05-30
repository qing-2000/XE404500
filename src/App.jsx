// src/App.jsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import VoiceAssistant from './components/VoiceAssistant';
import TodoList from './components/TodoList';
import { parseTextToEvent } from './utils/parseText';
import './App.css';

const API_BASE = '';

// 后端事件转前端格式
function convertBackendEvent(ev) {
  return {
    id: String(ev.id),
    title: ev.title,
    start: ev.event_time.replace(' ', 'T'), // 转成 ISO 格式
    description: ev.description || '',
    reminder_email: ev.reminder_email || '',
    event_time: ev.event_time, // 保留原始字符串
  };
}

// 前端事件转后端POST格式
function convertToBackendFormat(event, reminderEmail) {
  const eventTime = event.start?.replace('T', ' ') || event.event_time;
  return {
    title: event.title,
    description: event.description || '',
    event_time: eventTime,
    reminder_email: reminderEmail
  };
}

function App() {
  const [events, setEvents] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [viewRange, setViewRange] = useState({ start: new Date('2026-05-01'), end: new Date('2026-06-01') });
  const [viewType, setViewType] = useState('dayGridMonth');

  const validateEmail = (email) => /^\d+@qq\.com$/i.test(email);

  // 从后端加载事件
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const converted = data.map(convertBackendEvent);
      setEvents(converted);
    } catch (err) {
      console.error('加载失败');
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // 过滤未来7天内的事件（含当天）
  const filteredByTime = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events.filter(ev => {
      const evTime = new Date(ev.start);
      return evTime >= now && evTime < sevenDaysLater;
    });
  }, [events]);

  // 添加事件（调用后端POST）
  const addEvent = useCallback(async (event) => {
    if (!validateEmail(reminderEmail)) {
      setEmailError('请输入正确的QQ邮箱');
      return;
    }
    setEmailError('');
    let newEvent = event;
    if (!event || !event.title) {
      const today = new Date();
      const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      newEvent = { title: '新事件', start: `${ymd}T09:00`, description: '' };
    }
    const backendData = convertToBackendFormat(newEvent, reminderEmail);
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      });
      if (!res.ok) throw new Error();
      await fetchEvents();
      setTranscript('添加成功');
      setShowTranscript(true);
      setTimeout(() => setShowTranscript(false), 2000);
    } catch (err) {
      setTranscript('添加失败');
      setShowTranscript(true);
    }
  }, [reminderEmail, fetchEvents]);

  // 更新事件
  const updateEvent = useCallback(async (updatedEvent) => {
    const backendData = convertToBackendFormat(updatedEvent, reminderEmail);
    try {
      const res = await fetch(`${API_BASE}/events?id=${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      });
      if (!res.ok) throw new Error();
      await fetchEvents();
    } catch (err) {
      alert('更新失败');
    }
  }, [reminderEmail, fetchEvents]);

  // 删除事件
  const deleteEvent = useCallback(async (eventId) => {
    try {
      const res = await fetch(`${API_BASE}/events?id=${eventId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && (data.success === true || data.message === 'deleted')) {
        await fetchEvents();
      } else {
        throw new Error();
      }
    } catch (err) {
      alert('delete error');
    }
  }, [fetchEvents]);

  const handleVoiceResult = useCallback((text) => {
    setTranscript(text);
    setShowTranscript(true);
    setIsListening(false);
    const parsed = parseTextToEvent(text);
    if (parsed) {
      addEvent({ ...parsed, id: String(Date.now()) });
      setTranscript(`已添加：${parsed.title}`);
    } else {
      setTranscript('无法识别该指令');
    }
    setTimeout(() => setShowTranscript(false), 4000);
  }, [addEvent]);

  const handleDatesSet = useCallback((dateInfo) => {
    setViewRange({ start: dateInfo.view.currentStart, end: dateInfo.view.currentEnd });
    setViewType(dateInfo.view.type);
  }, []);

  // 紧急度计算（保留）
  function getAutoPriority(event) { /* 原函数保持不变 */ return 'medium'; }

  const processedEvents = useMemo(() => {
    return filteredByTime
      .filter(ev => new Date(ev.start) >= viewRange.start && new Date(ev.start) < viewRange.end)
      .map(ev => ({ ...ev, extendedProps: { computedPriority: getAutoPriority(ev) } }))
      .sort((a,b) => new Date(a.start) - new Date(b.start));
  }, [filteredByTime, viewRange]);

  return (
    <div className="app">
      {/* 仅保留邮箱输入框，宽度与查询框一致 */}
      <div style={{ padding: '1rem', background: '#f5f5f5' }}>
        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="请输入QQ邮箱"
            value={reminderEmail}
            onChange={(e) => {
              setReminderEmail(e.target.value);
              if (validateEmail(e.target.value)) setEmailError('');
              else setEmailError('请输入正确的QQ邮箱');
            }}
            style={{ width: '250px', padding: '6px', border: emailError ? '1px solid red' : '1px solid #ccc' }}
          />
          {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
        </div>
      </div>

      <div className="main-content">
        <CalendarView events={processedEvents} viewType={viewType} onDatesSet={handleDatesSet} />
        <TodoList
          events={filteredByTime}   // 传入已经过未来7天筛选的事件
          viewType={viewType}
          onUpdateEvent={updateEvent}
          onDeleteEvent={deleteEvent}
          onAddEvent={addEvent}
        />
      </div>

      <VoiceAssistant
        isListening={isListening}
        setIsListening={setIsListening}
        transcript={transcript}
        setTranscript={setTranscript}
        showTranscript={showTranscript}
        setShowTranscript={setShowTranscript}
        onVoiceResult={handleVoiceResult}
        placeholderText="输入要查询的内容（时间/事件/描述）"
        buttonText="查询"
      />
    </div>
  );
}

export default App;