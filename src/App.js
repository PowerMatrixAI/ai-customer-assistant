import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import ReactMarkdown from 'react-markdown';
import { MdOutlinePsychologyAlt, MdOutlineSmartToy } from 'react-icons/md';

const API_URL = process.env.REACT_APP_API_URL;
const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;
const BOT_ID_BASIC = process.env.REACT_APP_BOT_ID_BASIC;
const BOT_ID_CUTIE = process.env.REACT_APP_BOT_ID_CUTIE;

function getWelcomeMessage(useCutie) {
  return useCutie
    ? '哈喽呀，我是您的美容小助理，有什么变美的愿望可以和我许愿呢～✨'
    : '您好，我是医美AI客服助手，有什么可以帮您？';
}

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: getWelcomeMessage(false) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [useCutie, setUseCutie] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: useCutie ? BOT_ID_CUTIE : BOT_ID_BASIC,
          user: 'web_user_001',
          query: input,
        }),
      });
      const data = await res.json();
      let reply = '很抱歉，未能获取到回复。';
      if (data && data.messages) {
        const answer = data.messages.find(m => m.role === 'assistant' && m.type === 'answer');
        reply = answer ? answer.content : reply;
      }
      setMessages(msgs => [...msgs, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'assistant', content: '网络异常，请稍后重试。' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSwitchAgent = () => {
    setUseCutie(v => {
      const next = !v;
      setMessages([{ role: 'assistant', content: getWelcomeMessage(next) }]);
      setInput('');
      return next;
    });
  };

  return (
    <div className="ai-app">
      <div className="ai-header">
        <div className="ai-agent-switch-bar">
          <span className="ai-agent-label">
            {useCutie ? <MdOutlinePsychologyAlt className="ai-agent-icon" /> : <MdOutlineSmartToy className="ai-agent-icon" />}
            {useCutie ? '人性化Bot' : '常规Bot'}
          </span>
          <label className="ai-switch">
            <input type="checkbox" checked={useCutie} onChange={handleSwitchAgent} />
            <span className="ai-slider" />
          </label>
        </div>
        <h1>医美AI客服助手</h1>
        <div className="ai-subtitle">您的美容引路人</div>
      </div>
      <div className="ai-intro">
        使用先进AI大模型技术 + 医美行业专业知识库 + 医美行业定制化AI Agent，构建专业化、人性化的24h在线智能客服
      </div>
      <div className="ai-chat-container">
        <div className="ai-chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-msg ai-msg-${msg.role}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {loading && (
            <div className="ai-msg ai-msg-assistant ai-loading">
              <AiOutlineLoading3Quarters className="ai-loading-icon" /> 正在生成回复...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="ai-chat-input-bar">
          <textarea
            className="ai-chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入您的问题..."
            rows={2}
            disabled={loading}
          />
          <button className="ai-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
      <footer className="ai-footer">由PowerMatrix提供技术支持</footer>
    </div>
  );
}

export default App;
