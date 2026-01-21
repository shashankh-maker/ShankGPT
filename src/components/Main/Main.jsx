import React, { useState, useRef, useEffect } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import ReactMarkdown from "react-markdown";

const Main = ({ chats, setChats, activeChatIndex, setActiveChatIndex }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // ✅ KEEP messages in sync with selected chat
  useEffect(() => {
    if (activeChatIndex !== null && chats[activeChatIndex]) {
      setMessages(chats[activeChatIndex].messages);
    }
    if (activeChatIndex === null) {
      setMessages([]);
    }
  }, [activeChatIndex, chats]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };

    // ✅ SAFE message source
    const baseMessages =
      activeChatIndex !== null && chats[activeChatIndex]
        ? chats[activeChatIndex].messages
        : messages;

    let updatedMessages = [...baseMessages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await res.json();
      const aiMessage = { role: "ai", content: data.result };

      updatedMessages = [...updatedMessages, aiMessage];
      setMessages(updatedMessages);

      // ✅ History update
      if (activeChatIndex === null) {
        setChats(prev => [
          {
            title: userMessage.content.slice(0, 30),
            messages: updatedMessages,
          },
          ...prev,
        ]);
        setActiveChatIndex(0);
      } else {
        setChats(prev =>
          prev.map((chat, i) =>
            i === activeChatIndex
              ? { ...chat, messages: updatedMessages }
              : chat
          )
        );
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "⚠️ Error communicating with backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="nav">
        <p>ShankGPT</p>
        <img src={assets.beard_icon} alt="User Icon" />
      </div>

      <div className="main-container">
        {messages.length === 0 && !loading && (
          <div className="greet">
            <p><span>Hello, Dev.</span></p>
            <p>How can I help you today?</p>
          </div>
        )}

        <div className="chat-area">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.role === "user" ? "user" : "ai"}`}
            >
              {msg.role === "ai"
                ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                : <p>{msg.content}</p>}
            </div>
          ))}

          {loading && <div className="chat-bubble ai">🤖 Thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="main-bottom">
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter a prompt here"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();   // ✅ FIX
                  sendPrompt();
                }
              }}
            />

            <div>
              <img src={assets.gallery_icon} alt="Gallery" />
              <img src={assets.mic_icon} alt="Mic" />
              <img
                src={assets.send_icon}
                alt="Send"
                onClick={sendPrompt}
                style={{ cursor: "pointer", opacity: loading ? 0.5 : 1 }}
              />
            </div>
          </div>

          <p className="bottom-info">
            AI-generated responses may not be perfect. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
