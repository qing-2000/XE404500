import { useState, useCallback } from 'react';
import CalendarView from './components/CalendarView';
import VoiceAssistant from './components/VoiceAssistant';
import './App.css';

const INITIAL_EVENTS = [
  { title: '项目启动会', start: '2026-05-29', allDay: true },
  { title: '提交周报', start: '2026-05-30', allDay: true }
];

function App() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  // 由 VoiceAssistant 回调，当识别完成时调用
  const handleVoiceResult = useCallback((text) => {
    setTranscript(text);
    setShowTranscript(true);
    setIsListening(false);
    // 这里可以接着调用解析函数，然后添加事件
    // 暂时先只显示识别结果
  }, []);

  const addEvent = useCallback((event) => {
    setEvents(prev => [...prev, event]);
  }, []);

  return (
    <div className="app">
      <CalendarView events={events} />
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