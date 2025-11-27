import { GoogleGenAI } from "@google/genai";

// دالة لجلب المفتاح من التخزين المحلي
const getApiKey = (): string | null => {
  return localStorage.getItem('GEMINI_API_KEY');
};

export const getRecipeSuggestion = async (ingredients: string): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return "يرجى الذهاب إلى صفحة الإعدادات وإدخال مفتاح Google Gemini API لتفعيل الشيف الذكي.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelId = 'gemini-2.5-flash'; 
    const prompt = `
      أنت مساعد شيف محترف متخصص في المأكولات البحرية.
      قام العميل بشراء: ${ingredients}.
      اقترح وصفة قصيرة ولذيذة أو نصيحة للطهي لهذه المكونات.
      اجعل الرد باللغة العربية، ومختصراً (أقل من 150 كلمة)، مع خطوات واضحة.
      إذا كان المدخل ليس طعاماً بحرياً، اعتذر بأسلوب مهذب ووضح أن تخصصك هو الأسماك.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "عذراً، لا يمكنني اقتراح وصفة في الوقت الحالي.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالشيف الذكي. تأكد من صحة مفتاح API.";
  }
};