import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import API from "../services/api";

const ChatBox = ({ documentId }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || loading) {
      return;
    }

    const currentQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await API.post("/chat", {
        question: currentQuestion,
        documentId,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
        },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your question. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">

      <div className="chat-messages">

        {messages.length === 0 && (
          <div className="chat-empty">

            <div className="chat-empty-icon">
              💬
            </div>

            <h3>Ask your PDF anything</h3>

            <p>
              Ask questions and I'll answer
              using information from your
              uploaded document.
            </p>

          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-row ${message.role}`}
          >

            <div className="message-avatar">
              {message.role === "user"
                ? "You"
                : "AI"}
            </div>

            <div className="message-content">

              <div className="message-name">
                {message.role === "user"
                  ? "You"
                  : "AI Assistant"}
              </div>

              {message.role === "assistant" ? (
                <div className="markdown-content">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{message.content}</p>
              )}

            </div>

          </div>
        ))}

        {loading && (
          <div className="message-row assistant">

            <div className="message-avatar">
              AI
            </div>

            <div className="message-content">

              <div className="message-name">
                AI Assistant
              </div>

              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>

          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      <form
        onSubmit={handleSubmit}
        className="chat-form"
      >

        <input
          type="text"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          placeholder="Ask something about this PDF..."
          disabled={loading}
        />

        <button
          type="submit"
          disabled={
            loading ||
            !question.trim()
          }
        >
          {loading ? "..." : "Send"}
        </button>

      </form>

    </div>
  );
};

export default ChatBox;