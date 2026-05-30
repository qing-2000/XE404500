import { useEffect, useRef } from 'react';
import CommandHint from './CommandHint';
import './VoiceAssistant.css';
import React from 'react';
function VoiceAssistant({
  isListening,
  setIsListening,
  transcript,
  setTranscript,
  showTranscript,
  setShowTranscript,
  onVoiceResult
}) {
  const recognitionRef = useRef(null);

  // 初始化语音识别对象
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('当前浏览器不支持语音识别');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';            // 中文识别
    recognition.interimResults = false;    // 只获取最终结果，省去中间过程
    recognition.continuous = false;        // 单次识别

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setShowTranscript(true);
      setIsListening(false);

      // 将识别文字传给父组件处理
      if (onVoiceResult) onVoiceResult(text);
    };

    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      setTranscript('识别失败，请重试');
      setShowTranscript(true);
      setIsListening(false);

      // 3秒后自动隐藏错误提示
      setTimeout(() => setShowTranscript(false), 3000);
    };

    recognition.onend = () => {
      // 无论成功或失败，确保聆听状态关闭
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [setTranscript, setShowTranscript, setIsListening, onVoiceResult]);

  // 点击麦克风开始/结束
  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('您的浏览器不支持语音识别，请使用 Chrome 浏览器');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setShowTranscript(false);
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('启动语音识别失败:', error);
        setIsListening(false);
      }
    }
  };

  // 自动隐藏识别结果气泡
  useEffect(() => {
    if (showTranscript && transcript) {
      const timer = setTimeout(() => setShowTranscript(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showTranscript, transcript, setShowTranscript]);

  return (
    <div className="voice-assistant">
      <CommandHint />
      {showTranscript && (
        <div className="transcript-bubble">
          <span className="transcript-text">
            {transcript || '没听清，请再说一次'}
          </span>
        </div>
      )}
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