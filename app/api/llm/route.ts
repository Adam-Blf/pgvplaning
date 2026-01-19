import { NextRequest, NextResponse } from 'next/server';

// Liste blanche des hosts autorisés pour les appels API externes (SSRF protection)
const ALLOWED_HOSTS = [
  'localhost',
  '127.0.0.1',
  'api-inference.huggingface.co',
  'api.openai.com',
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
];

function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return ALLOWED_HOSTS.some(host =>
      url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

// System prompt optimisé pour les messages d'absence
const SYSTEM_PROMPT = `Tu es un assistant RH spécialisé dans la rédaction de messages d'absence professionnels pour une entreprise française.

Règles:
1. Génère UNIQUEMENT le corps du message, jamais l'objet
2. Inclus TOUJOURS "[DATE_RETOUR]" là où la date de retour doit apparaître
3. Adapte le ton selon la demande (professionnel, amical, formel)
4. Les messages doivent être concis (5-8 lignes maximum)
5. Termine toujours par une formule de politesse appropriée au ton`;

// API Hugging Face gratuite (fallback pour la production)
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

async function callHuggingFace(prompt: string, hfToken?: string): Promise<string> {
  const fullPrompt = `<s>[INST] ${SYSTEM_PROMPT}

${prompt} [/INST]`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Token HF optionnel (augmente les limites de rate)
  if (hfToken) {
    headers['Authorization'] = `Bearer ${hfToken}`;
  }

  const response = await fetch(HUGGINGFACE_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur Hugging Face (${response.status})`);
  }

  const data = await response.json();

  // Format de réponse HF Inference API
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }

  return data.generated_text || 'Aucune réponse générée';
}

async function callOpenAICompatible(
  prompt: string,
  apiEndpoint: string,
  apiKey?: string,
  modelName?: string
): Promise<string> {
  // Détecter le type d'endpoint pour adapter le modèle
  const isLocal = apiEndpoint.includes('localhost') || apiEndpoint.includes('127.0.0.1');
  const model = modelName || (isLocal ? 'pgv-absence' : 'gpt-3.5-turbo');

  const requestBody = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
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
    throw new Error(errorData.error?.message || `Erreur API (${response.status})`);
  }

  const data = await response.json();

  return data.choices?.[0]?.message?.content
    || data.response
    || data.text
    || data.output
    || 'Aucune réponse générée';
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, apiEndpoint, modelName, useHuggingFace } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt requis' },
        { status: 400 }
      );
    }

    let text: string;

    // Si useHuggingFace est true OU si endpoint est "huggingface" OU si aucun endpoint n'est configuré
    if (useHuggingFace || !apiEndpoint || apiEndpoint === 'huggingface') {
      // Utiliser l'API Hugging Face gratuite
      text = await callHuggingFace(prompt, apiKey);
    } else {
      // Valider l'endpoint contre SSRF
      if (!isAllowedEndpoint(apiEndpoint)) {
        return NextResponse.json(
          { error: 'Endpoint non autorisé. Utilisez un service API connu (OpenAI, HuggingFace, localhost).' },
          { status: 403 }
        );
      }
      // Utiliser l'endpoint configuré (local, OpenAI, etc.)
      text = await callOpenAICompatible(prompt, apiEndpoint, apiKey, modelName);
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Erreur LLM:', error);

    // Si l'erreur vient d'un endpoint local, essayer Hugging Face en fallback
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
