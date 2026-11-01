import {
  ArrowRight,
  Bot,
  BookOpen,
  Mic,
  Paperclip,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";

type QuickAction = {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Comment déposer un document ?", icon: Paperclip },
  { label: "Crée une méthode de révision", icon: BookOpen },
  { label: "Explique le statut en attente", icon: Mic },
];

export function FlowAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; type: "bot" | "user" }[]>([
    {
      text: "Bonjour Étudiant. Je peux t'aider à réviser, comprendre un cours ou utiliser ClassFlow.",
      type: "bot",
    },
  ]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { text, type: "user" }]);
    setInput("");

    // Simuler une réponse de l'assistant
    setTimeout(() => {
      const reply =
        "Je peux t'aider avec cela. Peux-tu me préciser de quel document ou de quel cours il s'agit ?";
      setMessages((prev) => [...prev, { text: reply, type: "bot" }]);
    }, 800);
  }

  return (
    <div className="flow-assistant">
      <div className="flow-header">
        <div className="flow-brand">
          <div className="flow-mark">
            <Bot size={22} />
          </div>
          <div>
            <strong>Flow Assistant</strong>
            <span className="flow-badge">
              <Sparkles size={10} /> Propulsé par Gemini
            </span>
          </div>
        </div>
        <button className="flow-close" aria-label="Fermer l'assistant">
          <span>✕</span>
        </button>
      </div>

      <div className="flow-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flow-message ${msg.type}`}
          >
            {msg.type === "bot" ? (
              <>
                <div className="flow-avatar">
                  <Bot size={16} />
                </div>
                <div className="flow-bubble">{msg.text}</div>
              </>
            ) : (
              <>
                <div className="flow-bubble user">{msg.text}</div>
                <div className="flow-avatar user">
                  <User size={14} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flow-quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="flow-quick"
            onClick={() => {
              setInput(action.label);
              handleSend();
            }}
          >
            <action.icon size={14} strokeWidth={1.6} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div className="flow-input-area">
        <p className="flow-disclaimer">
          Flow peut se tromper. Vérifiez les informations importantes.
        </p>
        <div className="flow-input-wrapper">
          <input
            className="flow-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Posez votre question à Flow…"
          />
          <button
            className="flow-send"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
