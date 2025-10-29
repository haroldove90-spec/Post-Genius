import { GoogleGenAI, Modality } from "@google/genai";
import { PostTone } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePostContent = async (topic: string, tone: PostTone, cta: string): Promise<string> => {
  const ctaInstruction = cta ? `Integra de forma natural la siguiente llamada a la acción: '${cta}'.` : '';

  const prompt = `
    Actúa como un experto en gestión de redes sociales para una Fanpage de Facebook en español.
    Tu tarea es escribir una publicación atractiva y efectiva.

    **Instrucciones:**
    1.  **Tema de la publicación:** ${topic}
    2.  **Tono deseado:** ${tone}
    3.  **Llamada a la acción:** ${ctaInstruction}
    4.  **Formato:** Escribe un texto conciso y atractivo para una publicación de Facebook. Utiliza saltos de línea para mejorar la legibilidad.
    5.  **Hashtags:** Al final de la publicación, incluye entre 3 y 5 hashtags relevantes y populares en español.

    **Salida esperada:**
    Devuelve únicamente el texto de la publicación y los hashtags. No incluyas ningún preámbulo, explicación o texto adicional como "Aquí está tu publicación:".
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    throw new Error("No se pudo generar el contenido. Por favor, inténtalo de nuevo.");
  }
};

export const generatePostImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Una imagen de alta calidad, cinematográfica y visualmente atractiva para una publicación en redes sociales sobre: ${prompt}` }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No se encontró ninguna imagen en la respuesta de la IA.");

  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    throw new Error("No se pudo generar la imagen. Por favor, inténtalo de nuevo.");
  }
};
