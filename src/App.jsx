import { useState, useCallback } from 'react';
import CalendarView from './components/CalendarView';
import VoiceAssistant from './components/VoiceAssistant';
import TodoList from './components/TodoList';
import './App.css';

const INITIAL_EVENTS = [
  {
    id: '1',
    title: '项目启动会',
    start: '2026-05-29T14:00:00',
    priority: 'high',
    extendedProps: {
      location: '腾讯大厦',
      locationUrl: 'https://map.baidu.com/search/腾讯大厦',
      person: '张三',
      description: '讨论项目方案'
    }
  },
  {
    id: '2',
    title: '提交周报',
    start: '2026-05-30T09:00:00',
    priority: 'medium',
    extendedProps: {
      location: '办公室',
      locationUrl: 'https://map.baidu.com/search/办公室',
      person: '自己',
      description: '完成本周工作总结'
    }
  }
];

function App() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  // 视图范围和类型
  const [viewRange, setViewRange] = useState({ start: new Date('2026-05-01'), end: new Date('2026-06-01') });
  const [viewType, setViewType] = useState('dayGridMonth');

  const handleVoiceResult = useCallback((text) => {
    setTranscript(text);
    setShowTranscript(true);
    setIsListening(false);
  }, []);

  const addEvent = useCallback((event) => {
    if (!event || typeof event !== 'object' || event.nativeEvent || !event.title) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      event = {
        id: String(Date.now()),
        title: '新事件',
        start: `${year}-${month}-${day}T09:00`,
        priority: 'medium',
        extendedProps: {
          location: '',
          locationUrl: '',
          person: '',
          description: ''
        }
      };
    } else {
      if (!event.id) event.id = String(Date.now());
      if (!event.priority) event.priority = 'medium';
    }

    setEvents(prev => [...prev, event]);
  }, []);

  const updateEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(ev => (ev.id === updatedEvent.id ? updatedEvent : ev)));
  }, []);

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(ev => ev.id !== eventId));
  }, []);

  // 日历视图切换时更新视图范围和类型
  const handleDatesSet = (dateInfo) => {
    const { view } = dateInfo;
    setViewRange({ start: view.currentStart, end: view.currentEnd });
    setViewType(view.type);
  };

  // 根据视图范围过滤事件
  const filteredEvents = events.filter(ev => {
    const d = new Date(ev.start);
    return d >= viewRange.start && d < viewRange.end;
  });

  // 按紧急程度排序（urgent > high > medium > low），同优先级按时间
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const pa = priorityOrder[a.priority] || 0;
    const pb = priorityOrder[b.priority] || 0;
    if (pa !== pb) return pb - pa;  // 降序
    return new Date(a.start) - new Date(b.start); // 时间升序
  });

  return (
    <div className="app">
      <div className="main-content">
        <CalendarView
          events={events}
          viewType={viewType}
          onDatesSet={handleDatesSet}
        />
        <TodoList
          events={sortedEvents}
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
        showTranscript={showTranscript}
        setShowTranscript={setShowTranscript}
        onVoiceResult={handleVoiceResult}
        addEvent={addEvent}
      />
    </div>
  );
}

export default App;