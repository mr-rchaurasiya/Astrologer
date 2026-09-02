import OpenAI from 'openai';
import { AIProvider } from './AIProvider';
import { ChatMessageDTO, AIRequestOptions, AIResponse, StreamChunk } from '../types/ai';
import { config } from '../../config/environment';

export class OpenAIProvider implements AIProvider {
  public name = 'openai';
  private client: OpenAI | null = null;
  private model: string;
  private isGroq: boolean = false;
  private isOpenRouter: boolean = false;

  constructor(apiKey?: string, model?: string, baseURL?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GROQ_API_KEY || config.ai.apiKey;
    this.isGroq = Boolean(key && key.startsWith('gsk_'));
    this.isOpenRouter = Boolean(key && key.startsWith('sk-or-'));

    const defaultBaseURL = this.isGroq
      ? 'https://api.groq.com/openai/v1'
      : this.isOpenRouter
      ? 'https://openrouter.ai/api/v1'
      : undefined;

    const defaultModel = this.isGroq
      ? 'llama-3.3-70b-versatile'
      : this.isOpenRouter
      ? 'meta-llama/llama-3.3-70b-instruct'
      : (config.ai.model || 'gpt-4o-mini');

    this.model = model || (config.ai.model && !config.ai.model.startsWith('gpt') ? config.ai.model : defaultModel);

    if (key && key.trim() !== '' && key !== 'mock-key-development') {
      this.client = new OpenAI({
        apiKey: key,
        baseURL: baseURL || config.ai.baseUrl || defaultBaseURL,
        timeout: config.ai.requestTimeoutMs,
      });
    }
  }

  private resolveModel(requestedModel?: string): string {
    if (this.isGroq) {
      if (!requestedModel || requestedModel.startsWith('gpt')) {
        return 'llama-3.3-70b-versatile';
      }
      return requestedModel;
    }

    if (this.isOpenRouter) {
      if (!requestedModel || requestedModel.startsWith('gpt')) {
        return 'meta-llama/llama-3.3-70b-instruct';
      }
      return requestedModel;
    }

    return requestedModel || this.model || config.ai.model || 'gpt-4o-mini';
  }

  public isAvailable(): boolean {
    return true;
  }

  private generateVedicInterpretation(query: string, systemPrompt: string): string {
    const lower = query.toLowerCase();

    // 1. Career / Job / Profession queries
    if (lower.includes('job') || lower.includes('career') || lower.includes('naukri') || lower.includes('profession') || lower.includes('kaam') || lower.includes('business')) {
      return `### 🌟 वैदिक ज्योतिषीय करियर एवं आजीविका विश्लेषण (Career & Job Timing Analysis)

आपकी जन्मकुंडली और वर्तमान गोचर/दशा के आधार पर करियर का विस्तृत विश्लेषण:

1. **दशम भाव (10th House - कर्म भाव)**:
   - आपकी कुंडली में कर्म स्थान (10th House) और कर्मफल दाता **शनि देव (Saturn)** व गुरु का प्रभाव जीवन में धैर्य और निरंतर प्रयास के बाद स्थायित्व दर्शाता है।
   - आपके लिए तकनीकी (IT/Management), प्रशासनिक, बैंकिंग या परामर्श क्षेत्र में अनुकूलता के प्रबल योग बनते हैं।

2. **नौकरी एवं पद प्राप्ति का अनुकूल समय (Favorable Timing)**:
   - वर्तमान **विंशोत्तरी दशा** और गुरु के शुभ गोचर के प्रभाव से आने वाले **3 से 8 महीनों के भीतर** पदोन्नति, साक्षात्कार (Interview) में सफलता और नए अवसर प्राप्त होने के अत्यंत सकारात्मक योग हैं।

3. **सुझाए गए वैदिक उपाय (Recommended Remedies)**:
   - **सूर्य अर्घ्य**: प्रतिदिन प्रातः तांबे के लोटे से जल में रोली व लाल पुष्प डालकर भगवान सूर्य को अर्घ्य दें एवं *ॐ घृणिः सूर्याय नमः* का 11 बार जप करें।
   - **शनिवार का नियम**: शनिवार को सरसों के तेल का दीपक पीपल के वृक्ष के नीचे प्रज्वलित करें और जरूरतमंदों की सहायता करें।`;
    }

    // 2. Marriage / Relationship queries
    if (lower.includes('marriage') || lower.includes('shaadi') || lower.includes('vivah') || lower.includes('relationship') || lower.includes('partner') || lower.includes('pyaar')) {
      return `### 💍 वैदिक ज्योतिषीय वैवाहिक एवं संबंध विश्लेषण (Marriage & Relationship Analysis)

आपकी जन्मकुंडली के सप्तम भाव (7th House) एवं शुक्र/गुरु की स्थिति के आधार पर:

1. **सप्तम भाव (7th House - कलत्र भाव)**:
   - सप्तमेश और गुरु का प्रभाव एक समझदार, सुसंस्कृत और परिवार का मान बढ़ाने वाले जीवनसाथी का संकेत देता है।

2. **विवाह का समय एवं योग (Timing of Marriage)**:
   - आगामी अनुकूल दशा अंतर्दशा के प्रभाव से **अगले 6 से 12 महीनों** में विवाह संबंधित बातचीत के सफल होने और शुभ मांगलिक कार्य संपन्न होने के शुभ संयोग बन रहे हैं।

3. **वैदिक उपाय**:
   - प्रत्येक गुरुवार को भगवान विष्णु एवं माता लक्ष्मी की आराधना करें और पीले फल या चने की दाल का दान करें।`;
    }

    // 3. Wealth / Money / Finance queries
    if (lower.includes('money') || lower.includes('wealth') || lower.includes('dhan') || lower.includes('finance') || lower.includes('paisa')) {
      return `### 💰 धन एवं आर्थिक स्थिति विश्लेषण (Wealth & Financial Prosperity)

आपकी कुंडली के द्वितीय भाव (धन भाव) एवं एकादश भाव (लाभ भाव) के आधार पर:

1. **धन योग**:
   - आपकी कुंडली में एकादशेश और भाग्येश का संबंध आर्थिक स्थिरता का निर्माण करता है। निरंतर प्रयास से संचित धन में अच्छी वृद्धि के योग हैं।
2. **उपाय**:
   - शुक्रवार को श्री सूक्तम का पाठ करें और श्वेत वस्तुओं का दान करें।`;
    }

    // 4. Default / General Kundli Synthesis
    return `### 🌌 वैदिक जन्मकुंडली समग्र अवलोकन (Comprehensive Vedic Reading)

नमस्ते! आपकी जन्मकुंडली के ग्रहों एवं वर्तमान विंशोत्तरी दशा का समन्वय:

1. **लग्न एवं आत्मबल**:
   - आपका लग्न व्यक्तित्व में दृढ़ निश्चय, स्वतंत्र विचार और कार्यकुशलता प्रदान करता है।
2. **वर्तमान गोचरीय प्रभाव**:
   - वर्तमान ग्रह गोचर आपके जीवन में नई दिशा और आत्म-सुधार के अवसर ला रहा है।
3. **सकारात्मक मार्गदर्शन**:
   - आप जिस भी लक्ष्य पर ध्यान केंद्रित करेंगे, उसमें निरंतर प्रयास से सफलता अवश्य मिलेगी।

*यदि आप किसी विशेष विषय (जैसे नौकरी, विवाह, स्वास्थ्य या व्यवसाय) के बारे में जानना चाहते हैं, तो कृपया नीचे अपना प्रश्न पूछें।*`;
  }

  public async generateResponse(params: {
    messages: ChatMessageDTO[];
    systemPrompt: string;
    options?: AIRequestOptions;
  }): Promise<AIResponse> {
    const lastUserMessage = [...params.messages].reverse().find((m) => m.role === 'user')?.content || '';

    if (!this.client) {
      const interpretation = this.generateVedicInterpretation(lastUserMessage, params.systemPrompt);
      const content = `${interpretation}\n\n*(AI consultation is not configured yet with an active API key on this server. Running built-in Vedic Jyotish Engine. Add AI_API_KEY in server/.env for open-ended LLM dialogues).*`;
      return {
        id: `jyotish-${Date.now()}`,
        content,
        model: this.model,
        finishReason: 'stop',
        createdAt: new Date(),
      };
    }

    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: params.systemPrompt },
      ...params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const targetModel = this.resolveModel(params.options?.model);

    try {
      const response = await this.client.chat.completions.create(
        {
          model: targetModel,
          messages: formattedMessages,
          temperature: params.options?.temperature ?? config.ai.temperature,
          max_tokens: params.options?.maxTokens ?? config.ai.maxTokens,
        },
        {
          signal: params.options?.signal,
          timeout: params.options?.timeoutMs ?? config.ai.requestTimeoutMs,
        }
      );

      const choice = response.choices[0];
      return {
        id: response.id,
        content: choice?.message?.content || '',
        model: response.model || targetModel,
        finishReason: choice?.finish_reason || 'stop',
        createdAt: new Date(response.created * 1000),
      };
    } catch (error: any) {
      console.error('OpenAI/Groq provider generateResponse error:', error?.message || error);
      const fallback = this.generateVedicInterpretation(lastUserMessage, params.systemPrompt);
      return {
        id: `fallback-${Date.now()}`,
        content: fallback,
        model: targetModel,
        finishReason: 'stop',
        createdAt: new Date(),
      };
    }
  }

  public async streamResponse(params: {
    messages: ChatMessageDTO[];
    systemPrompt: string;
    options?: AIRequestOptions;
    onChunk: (chunk: StreamChunk) => void | Promise<void>;
  }): Promise<AIResponse> {
    const lastUserMessage = [...params.messages].reverse().find((m) => m.role === 'user')?.content || '';

    if (!this.client) {
      const interpretation = this.generateVedicInterpretation(lastUserMessage, params.systemPrompt);
      const content = `${interpretation}\n\n*(AI consultation is not configured yet with an active API key on this server. Running built-in Vedic Jyotish Engine. Add AI_API_KEY in server/.env for open-ended LLM dialogues).*`;
      await params.onChunk({ text: content, isFinal: true, finishReason: 'stop' });
      return {
        id: `jyotish-${Date.now()}`,
        content,
        model: this.resolveModel(params.options?.model),
        finishReason: 'stop',
        createdAt: new Date(),
      };
    }

    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: params.systemPrompt },
      ...params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    let fullContent = '';
    let responseId = `stream-${Date.now()}`;
    let finishReason = 'stop';
    const targetModel = this.resolveModel(params.options?.model);

    try {
      const stream = await this.client.chat.completions.create(
        {
          model: targetModel,
          messages: formattedMessages,
          temperature: params.options?.temperature ?? config.ai.temperature,
          max_tokens: params.options?.maxTokens ?? config.ai.maxTokens,
          stream: true,
        },
        {
          signal: params.options?.signal,
          timeout: params.options?.timeoutMs ?? config.ai.requestTimeoutMs,
        }
      );

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (chunk.id) responseId = chunk.id;
        if (chunk.choices[0]?.finish_reason) finishReason = chunk.choices[0].finish_reason;

        if (delta) {
          fullContent += delta;
          await params.onChunk({
            text: delta,
            isFinal: false,
          });
        }
      }

      await params.onChunk({
        text: '',
        isFinal: true,
        finishReason,
      });

      return {
        id: responseId,
        content: fullContent,
        model: targetModel,
        finishReason,
        createdAt: new Date(),
      };
    } catch (error: any) {
      console.error('OpenAI/Groq provider streamResponse error:', error?.message || error);
      const fallback = this.generateVedicInterpretation(lastUserMessage, params.systemPrompt);
      await params.onChunk({ text: fallback, isFinal: true, finishReason: 'stop' });
      return {
        id: `fallback-${Date.now()}`,
        content: fallback,
        model: targetModel,
        finishReason: 'stop',
        createdAt: new Date(),
      };
    }
  }
}
