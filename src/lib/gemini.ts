/**
 * Client pour l'API Google Generative AI (Gemini).
 * La clé API doit être définie dans VITE_GEMINI_API_KEY dans .env.local.
 */

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-1.5-flash";

function getApiKey(): string | null {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return key ?? null;
}

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export async function generateGeminiResponse(
  messages: GeminiMessage[]
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return (
      "Je ne suis pas encore configuré. Demandez à votre administrateur de définir " +
      "la variable d'environnement VITE_GEMINI_API_KEY avec votre clé API Google Gemini."
    );
  }

  try {
    // Convertir les messages au format attendu par l'API Gemini
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const response = await fetch(
      `${API_BASE}/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Erreur API Gemini:", response.status, errorText);
      return (
        "Désolé, je n'ai pas pu obtenir de réponse pour le moment. " +
        "Vérifiez votre clé API Gemini et réessayez."
      );
    }

    const data = await response.json();

    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      return (
        "Je n'ai pas pu générer de réponse. Veuillez réessayer avec une autre question."
      );
    }

    return text;
  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini:", error);
    return (
      "Une erreur est survenue lors de la communication avec l'assistant. " +
      "Vérifiez votre connexion et réessayez."
    );
  }
}
