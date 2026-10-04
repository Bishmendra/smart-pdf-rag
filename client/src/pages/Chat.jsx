import { useParams, useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";

const Chat = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="chat-page">
      <button
        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Back to Dashboard
      </button>

      <h1>Chat with PDF</h1>

      <p>
        Ask questions about the
        uploaded document.
      </p>

      <ChatBox
        documentId={documentId}
      />
    </div>
  );
};

export default Chat;