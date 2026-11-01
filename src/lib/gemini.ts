/**
 * Client pour l'API Google Generative AI (Gemini).
 * L'assistant est temporairement indisponible : aucun appel réseau n'est effectué côté navigateur.
 */

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export async function generateGeminiResponse(
  _messages: GeminiMessage[]
): Promise<string> {
  return "Assistant bientôt disponible";
}
