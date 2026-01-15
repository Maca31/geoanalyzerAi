import { buscarCoordenadas, capasUrbanismo, riesgoInundacion } from './geo-tools';

// La API key se lee desde variables de entorno (archivo .env.local con prefijo VITE_)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

// Definición de las tools para function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'buscarCoordenadas',
      description: 'Busca las coordenadas geográficas (latitud y longitud) a partir de una dirección o nombre de lugar usando OpenStreetMap',
      parameters: {
        type: 'object',
        properties: {
          direccion: {
            type: 'string',
            description: 'La dirección completa o nombre del lugar a buscar (ej: "Plaza Mayor, Madrid" o "Barcelona, España")'
          }
        },
        required: ['direccion']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'capasUrbanismo',
      description: 'Obtiene información detallada sobre infraestructura urbana y uso del suelo en un radio de 1km alrededor de unas coordenadas. Incluye hospitales, escuelas, parques, comercios, transporte público y clasificación de zona',
      parameters: {
        type: 'object',
        properties: {
          lat: {
            type: 'number',
            description: 'Latitud de la ubicación'
          },
          lon: {
            type: 'number',
            description: 'Longitud de la ubicación'
          }
        },
        required: ['lat', 'lon']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'riesgoInundacion',
      description: 'Evalúa los riesgos naturales de una ubicación incluyendo riesgo de inundación, riesgo sísmico y riesgo de incendio. Utiliza datos de elevación, precipitación y análisis geográfico',
      parameters: {
        type: 'object',
        properties: {
          lat: {
            type: 'number',
            description: 'Latitud de la ubicación'
          },
          lon: {
            type: 'number',
            description: 'Longitud de la ubicación'
          }
        },
        required: ['lat', 'lon']
      }
    }
  }
];

export async function analyzeLocation(lat: number, lon: number, address?: string): Promise<string> {
  console.log(`Analizando ubicación: ${lat}, ${lon}`);

  if (!OPENAI_API_KEY) {
    throw new Error(
      'Falta la variable de entorno VITE_OPENAI_API_KEY. Añádela en tu archivo .env.local en la raíz del proyecto.',
    );
  }

  // Prompt inicial para el análisis
  const userPrompt = `Analiza la ubicación en las coordenadas ${lat}, ${lon}${address ? ` (${address})` : ''}.

Debes utilizar las herramientas disponibles para obtener información real sobre:
1. Infraestructura urbana cercana (usa capasUrbanismo)
2. Riesgos naturales de la zona (usa riesgoInundacion)

IMPORTANTE: Sé REALISTA y CRÍTICO en tu análisis. Si la zona es desértica, remota, sin infraestructura, con riesgos altos, o con condiciones climáticas extremas, DEBES indicar claramente las LIMITACIONES para la habitabilidad y desarrollo urbano. No recomiendes usos urbanos si las condiciones no son adecuadas.

Luego genera un informe profesional que incluya:
- Descripción general de la zona (incluyendo características geográficas y climáticas)
- Infraestructura y servicios disponibles (o la falta de ellos)
- Análisis de riesgos identificados (inundación, sísmico, incendio)
- Evaluación REALISTA de habitabilidad y viabilidad de desarrollo
- Posibles usos urbanos recomendados SOLO si son viables (si no lo son, explica por qué)
- Recomendaciones finales honestas sobre las limitaciones y desafíos de la zona

Sé específico con los datos obtenidos y menciona las limitaciones cuando no haya datos disponibles o cuando las condiciones sean desfavorables.`;

  // Primera llamada a OpenAI con function calling
  let messages: any[] = [
    {
      role: 'system',
      content: 'Eres un experto analista geoespacial y urbanista REALISTA. Utilizas herramientas de análisis geográfico para proporcionar informes detallados y HONESTOS sobre ubicaciones. Debes ser CRÍTICO: si una zona es desértica, remota, sin infraestructura, o tiene condiciones extremas, DEBES indicarlo claramente y NO recomendar desarrollo urbano si no es viable. Siempre mencionas las fuentes de datos (OpenStreetMap, Open-Elevation, Open-Meteo) y las limitaciones de los análisis. Prioriza la seguridad y viabilidad real sobre recomendaciones optimistas.'
    },
    {
      role: 'user',
      content: userPrompt
    }
  ];

  let continueLoop = true;
  let iterationCount = 0;
  const maxIterations = 10;

  while (continueLoop && iterationCount < maxIterations) {
    iterationCount++;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    messages.push(assistantMessage);

    // Verificar si hay tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Ejecutar cada tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Ejecutando: ${functionName}`, functionArgs);

        let functionResult;

        try {
          switch (functionName) {
            case 'buscarCoordenadas':
              functionResult = await buscarCoordenadas(functionArgs.direccion);
              break;
            case 'capasUrbanismo':
              functionResult = await capasUrbanismo(functionArgs.lat, functionArgs.lon);
              break;
            case 'riesgoInundacion':
              functionResult = await riesgoInundacion(functionArgs.lat, functionArgs.lon);
              break;
            default:
              functionResult = { error: 'Función no reconocida' };
          }
        } catch (error) {
          functionResult = { error: `Error ejecutando ${functionName}: ${error}` };
        }

        // Añadir el resultado de la función a los mensajes
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResult)
        });
      }
    } else {
      // No hay más tool calls, tenemos la respuesta final
      continueLoop = false;
      
      return assistantMessage.content;
    }
  }

  // Si llegamos aquí, excedimos las iteraciones
  throw new Error('Se excedió el límite de iteraciones en el análisis');
}
