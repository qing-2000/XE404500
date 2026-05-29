import { useEffect, useRef } from 'react';
import CommandHint from './CommandHint';
import './VoiceAssistant.css';

function VoiceAssistant({
  isListening,
  setIsListening,
  transcript,
  showTranscript,
  setShowTranscript,
  onVoiceResult,
}) {
  const timeoutRef = useRef(null);

  // 点击麦克风模拟开始/结束
  const handleMicClick = () => {
    if (isListening) {
      // 停止监听
      setIsListening(false);
      // 模拟一个识别结果
      onVoiceResult('明天下午三点开会');
    } else {
      setIsListening(true);
      // 自动超时关闭
      timeoutRef.current = setTimeout(() => {
        setIsListening(false);
        onVoiceResult('明天下午三点开会');
      }, 3000);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // 3秒后自动隐藏识别结果气泡
  useEffect(() => {
    if (showTranscript && transcript) {
      const timer = setTimeout(() => setShowTranscript(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showTranscript, transcript, setShowTranscript]);

  return (
    <div className="voice-assistant">
      {/* 语音命令提示浮窗 */}
      <CommandHint />

      {/* 识别结果气泡 */}
      {showTranscript && (
        <div className="transcript-bubble">
          <span className="transcript-text">
            {transcript || '没听清，请再说一次'}
          </span>
        </div>
      )}

      {/* 麦克风按钮 + 状态环 */}
      <div className="mic-wrapper">
        {isListening && <div className="pulse-ring" />}
        <button
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={handleMicClick}
          aria-label="语音输入"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default VoiceAssistant;