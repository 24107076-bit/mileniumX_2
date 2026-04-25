import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const GROQ_API_KEY = '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';

export default function ChatWidget({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your MileniumX Copilot. I can help answer financial questions or guide you through the app. Try asking me to 'open the quiz' or 'go to dashboard'!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are the MileniumX AI Assistant. You help users navigate the wealth simulator platform and offer basic financial education.
Keep answers extremely concise (1-3 sentences max).
If the user asks to go to a specific page or section of the app, output exactly one of the following commands on a new line at the end of your response:
[NAVIGATE:dashboard]
[NAVIGATE:analysis]
[NAVIGATE:milestones]
[NAVIGATE:ai]
[NAVIGATE:quiz]
[NAVIGATE:settings]

Examples:
User: "Take me to my milestones" => Output: "Sure, let's look at your goals.\n[NAVIGATE:milestones]"
User: "I want to play the game" => Output: "Opening the Financial Quiz now!\n[NAVIGATE:quiz]"`
            },
            ...newMessages
          ],
          temperature: 0.5,
          max_tokens: 150
        })
      });

      const data = await response.json();
      const aiReply = data.choices[0].message.content;

      // Extract Navigation commands
      const navMatch = aiReply.match(/\[NAVIGATE:([a-z]+)\]/);
      let cleanReply = aiReply;
      
      if (navMatch) {
        cleanReply = aiReply.replace(/\[NAVIGATE:[a-z]+\]/g, '').trim();
        setTimeout(() => {
            onNavigate(navMatch[1]);
        }, 500); // short delay for UX
      }

      setMessages([...newMessages, { role: 'assistant', content: cleanReply }]);

    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'Oops! I had trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000,
          background: 'linear-gradient(135deg, var(--indigo), var(--teal))',
          color: 'white', border: 'none', borderRadius: '50%',
          width: '60px', height: '60px', display: isOpen ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          transition: 'transform 0.2s',
        }}
      >
        <Bot size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000,
          width: '380px', height: '560px',
          background: 'rgba(15, 15, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '16px 20px', 
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--teal))', borderRadius: '50%', padding: '6px' }}>
                <Bot size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>MileniumX Copilot</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Powered by Groq AI</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex', gap: '10px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{ 
                  flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                  background: m.role === 'user' ? 'var(--border)' : 'rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {m.role === 'user' ? <User size={14} color="#a1a1aa" /> : <Bot size={14} color="#818cf8" />}
                </div>
                <div style={{
                  background: m.role === 'user' ? 'var(--indigo)' : 'rgba(255,255,255,0.05)',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  padding: '12px 16px', borderRadius: '16px',
                  borderTopRightRadius: m.role === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                  fontSize: '0.9rem', lineHeight: 1.5, color: '#fff'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', alignSelf: 'flex-start' }}>
                <span className="dot dot-indigo" style={{ animation: 'pulse 1s infinite' }} />
                <span className="dot dot-teal" style={{ animation: 'pulse 1s infinite 0.2s' }} />
                <span className="dot dot-green" style={{ animation: 'pulse 1s infinite 0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ 
            padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', gap: '10px'
          }}>
            <input 
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                color: '#fff', outline: 'none'
              }}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{
              background: 'var(--indigo)', color: 'white', border: 'none',
              width: '44px', height: '44px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (loading || !input.trim()) ? 'default' : 'pointer',
              opacity: (loading || !input.trim()) ? 0.5 : 1
            }}>
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
