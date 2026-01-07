import { NextRequest, NextResponse } from 'next/server';

// System prompt optimisé pour les messages d'absence
const SYSTEM_PROMPT = `Tu es un assistant RH spécialisé dans la rédaction de messages d'absence professionnels pour une entreprise française.

Règles:
1. Génère UNIQUEMENT le corps du message, jamais l'objet
2. Inclus TOUJOURS "[DATE_RETOUR]" là où la date de retour doit apparaître
3. Adapte le ton selon la demande (professionnel, amical, formel)
4. Les messages doivent être concis (5-8 lignes maximum)
5. Termine toujours par une formule de politesse appropriée au ton`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, apiEndpoint, modelName } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt requis' },
        { status: 400 }
      );
    }

    if (!apiEndpoint) {
      return NextResponse.json(
        { error: 'Endpoint LLM non configuré' },
        { status: 400 }
      );
    }

    // Détecter si c'est Ollama pour adapter le nom du modèle
    const isOllama = apiEndpoint.includes('11434');
    const model = modelName || (isOllama ? 'pgv-absence' : 'gpt-3.5-turbo');

    // Format compatible OpenAI API (Ollama, vLLM, OpenAI, etc.)
    const requestBody = {
      model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `Erreur API LLM (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extraire le texte selon le format de réponse (compatible OpenAI)
    const text = data.choices?.[0]?.message?.content
      || data.response
      || data.text
      || data.output
      || 'Aucune réponse générée';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Erreur LLM:', error);
    return NextResponse.json(
      { error: 'Erreur de connexion au LLM' },
      { status: 500 }
    );
  }
}
