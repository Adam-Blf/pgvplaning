import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, apiEndpoint } = await request.json();

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

    // Format compatible OpenAI API (standard pour la plupart des LLMs)
    const requestBody = {
      model: 'pgv-absence-model', // Nom du modèle fine-tuné
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant RH spécialisé dans la rédaction de messages professionnels pour une entreprise française. Tu génères des messages d\'absence clairs, professionnels et personnalisés.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
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
