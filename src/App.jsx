import { useState, useCallback, useMemo } from 'react';
import CalendarView from './components/CalendarView';
import VoiceAssistant from './components/VoiceAssistant';
import TodoList from './components/TodoList';
import { parseTextToEvent } from './utils/parseText';
import './App.css';

const INITIAL_EVENTS = [
  {
    id: '1',
    title: '出勤',
    start: '2026-05-29T14:00:00',
    priority: 'high',
    extendedProps: {
      location: '机厅',
      person: '张三',
      description: '开白潘'
    }
  },
  {
    id: '2',
    title: '出勤',
    start: '2026-05-30T09:00:00',
    priority: 'medium',
    extendedProps: {
      location: '机厅',
      person: '李四',
      description: '开白系'
    }
  }
];

// 自动计算事件紧迫度
function getAutoPriority(event) {
  const now = new Date();
  const eventTime = new Date(event.start);
  const diffHours = (eventTime - now) / (1000 * 60 * 60);

  if (diffHours < 0) return 'low';

  if (diffHours <= 1) return 'urgent';

  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  if (eventTime <= endOfToday) return 'high';

  const dayOfWeek = now.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);
  if (eventTime <= endOfWeek) return 'medium';

  return 'low';
}

function App() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [viewRange, setViewRange] = useState({
    start: new Date('2026-05-01'),
    end: new Date('2026-06-01')
  });
  const [viewType, setViewType] = useState('dayGridMonth');

  // 添加事件
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

  // 更新事件
  const updateEvent = useCallback((updatedEvent) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === updatedEvent.id ? updatedEvent : ev))
    );
  }, []);

  // 删除事件
  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(ev => ev.id !== eventId));
  }, []);

  // 语音识别结果处理
  const handleVoiceResult = useCallback((text) => {
    setTranscript(text);
    setShowTranscript(true);
    setIsListening(false);

    const parsed = parseTextToEvent(text);
    if (parsed) {
      addEvent({ ...parsed, id: String(Date.now()) });
      setTranscript(`已添加：${parsed.title}`);
    } else {
      setTranscript('无法识别该指令，请重试');
    }

    setTimeout(() => setShowTranscript(false), 4000);
  }, [addEvent]);

  // 日历视图范围变化回调
  const handleDatesSet = useCallback((dateInfo) => {
    const { view } = dateInfo;
    setViewRange({ start: view.currentStart, end: view.currentEnd });
    setViewType(view.type);
  }, []);

  // 处理事件：过滤当前视图、附加自动优先级、排序
  const processedEvents = useMemo(() => {
    return events
      .filter(ev => {
        const d = new Date(ev.start);
        return d >= viewRange.start && d < viewRange.end;
      })
      .map(ev => ({
        ...ev,
        extendedProps: {
          ...ev.extendedProps,
          computedPriority: getAutoPriority(ev)
        }
      }))
      .sort((a, b) => {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        const pa = order[a.extendedProps.computedPriority] || 0;
        const pb = order[b.extendedProps.computedPriority] || 0;
        if (pa !== pb) return pb - pa;
        return new Date(a.start) - new Date(b.start);
      });
  }, [events, viewRange]);

  return (
    <div className="app">
      <div className="main-content">
        <CalendarView
          events={processedEvents}
          viewType={viewType}
          onDatesSet={handleDatesSet}
        />
        <TodoList
          events={processedEvents}
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
      />
    </div>
  );
}

export default App;