import {
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

type FlowAssistantProps = {
  onClose: () => void;
};

export function FlowAssistant({ onClose }: FlowAssistantProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    {
      role: "model",
      text: "Bonjour Étudiant. Je peux t'aider à réviser, comprendre un cours ou utiliser ClassFlow.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage = { role: "user" as const, text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      setMessages((prev) => [
        ...prev,
        { role: "model" as const, text: "Assistant bientôt disponible" },
      ]);
    } catch (error) {
      console.error("Erreur Flow Assistant:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model" as const,
          text:
            "Une erreur est survenue. Vérifiez votre configuration et réessayez.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
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
              <Sparkles size={10} /> Assistant bientôt disponible
            </span>
          </div>
        </div>
        <button className="flow-close" aria-label="Fermer l'assistant" onClick={onClose}>
          <span>✕</span>
        </button>
      </div>

      <div className="flow-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flow-message ${msg.role}`}
          >
            {msg.role === "model" ? (
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
        {isSending && (
          <div className="flow-message model">
            <div className="flow-avatar">
              <Bot size={16} />
            </div>
            <div className="flow-bubble">
              Flow réfléchit…
            </div>
          </div>
        )}
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
            disabled={isSending}
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
            disabled={isSending}
          />
          <button
            className="flow-send"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
          >
            <Send size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
