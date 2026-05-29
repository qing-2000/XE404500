import { useState, useCallback } from 'react';
import CalendarView from './components/CalendarView';
import VoiceAssistant from './components/VoiceAssistant';
import './App.css';

const INITIAL_EVENTS = [
  { title: '游玩PANDORA PARADOXXX Re Master', start: '2026-05-29', allDay: true },
  { title: '游玩系ぎて Re Master', start: '2026-05-30', allDay: true }
];

function App() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  const handleVoiceResult = useCallback((text) => {
    setTranscript(text);
    setShowTranscript(true);
    setIsListening(false);
    // 后续在这里接解析 + addEvent
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