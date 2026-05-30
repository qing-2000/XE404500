import { useState, useCallback } from 'react';
import CalendarView from './components/CalendarView';
import VoiceAssistant from './components/VoiceAssistant';
import TodoList from './components/TodoList';
import './App.css';

// 示例事件
const INITIAL_EVENTS = [
  {
    id: '1',
    title: '项目启动会',
    start: '2026-05-29T14:00:00',
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
  const [currentMonth, setCurrentMonth] = useState('2026-05');

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
      const defaultStart = `${year}-${month}-${day}T09:00`;

      event = {
        id: String(Date.now()),
        title: '新事件',
        start: defaultStart,  
        extendedProps: {
          location: '',
          locationUrl: '',
          person: '',
          description: ''
        }
      };
      } else {
        if (!event.id) event.id = String(Date.now());
      }

  setEvents(prev => [...prev, event]);
}, []);

  const updateEvent = useCallback((updatedEvent) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === updatedEvent.id ? updatedEvent : ev))
    );
  }, []);

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(ev => ev.id !== eventId));
  }, []);

  const handleDatesSet = (dateInfo) => {
    const start = dateInfo.view.currentStart;
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${year}-${month}`);
  };

  const monthEvents = events.filter(ev => {
    const d = new Date(ev.start);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}` === currentMonth;
  });

  return (
    <div className="app">
      <div className="main-content">
        <CalendarView
          events={events}
          onDatesSet={handleDatesSet}
        />
        <TodoList
          events={monthEvents}
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