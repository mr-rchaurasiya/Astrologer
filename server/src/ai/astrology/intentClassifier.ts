import { AstrologyIntent } from './astrologyContext.types';

interface IntentRule {
  intent: AstrologyIntent;
  keywords: string[];
  patterns: RegExp[];
  priority: number;
}

export class IntentClassifier {
  private static readonly RULES: IntentRule[] = [
    {
      intent: 'COMPATIBILITY',
      keywords: ['milan', 'guna', 'gun', 'ashtakoota', 'match', 'matchmaking', 'manglik', 'compatibility', 'synastry'],
      patterns: [/kundli\s+milan/i, /gun\s+milan/i, /match\s+with/i, /compatible\s+with/i, /are\s+we\s+compatible/i],
      priority: 10,
    },
    {
      intent: 'CAREER',
      keywords: ['career', 'job', 'profession', 'promotion', 'boss', 'interview', 'business', 'work', 'startup', 'employment', 'transfer', 'colleague', 'office', 'salary', 'raise'],
      patterns: [/get\s+a\s+job/i, /switch\s+job/i, /career\s+growth/i, /start\s+a\s+business/i, /will\s+i\s+get\s+promoted/i, /work\s+life/i, /my\s+career/i],
      priority: 9,
    },
    {
      intent: 'MARRIAGE',
      keywords: ['marriage', 'spouse', 'husband', 'wife', 'wedding', 'shaadi', 'vivah', 'matrimony', 'in-laws', 'life partner', 'marital'],
      patterns: [/when\s+will\s+i\s+get\s+married/i, /marriage\s+timing/i, /spouse\s+nature/i, /married\s+life/i, /future\s+husband/i, /future\s+wife/i],
      priority: 9,
    },
    {
      intent: 'RELATIONSHIP',
      keywords: ['relationship', 'love', 'dating', 'breakup', 'crush', 'affair', 'heartbreak', 'ex', 'partner', 'romance', 'commit'],
      patterns: [/love\s+life/i, /will\s+he\s+come\s+back/i, /will\s+she\s+come\s+back/i, /in\s+love\s+with/i, /relationship\s+future/i],
      priority: 8,
    },
    {
      intent: 'FINANCE',
      keywords: ['money', 'finance', 'wealth', 'rich', 'investment', 'invest', 'stock', 'crypto', 'debt', 'loan', 'property', 'loss', 'profit', 'savings', 'income'],
      patterns: [/financial\s+growth/i, /will\s+i\s+be\s+wealthy/i, /money\s+luck/i, /lottery/i, /buy\s+a\s+house/i, /buy\s+property/i],
      priority: 8,
    },
    {
      intent: 'EDUCATION',
      keywords: ['education', 'study', 'studies', 'exam', 'college', 'university', 'degree', 'admission', 'higher education', 'phd', 'course', 'school', 'marks'],
      patterns: [/will\s+i\s+clear\s+the\s+exam/i, /higher\s+studies/i, /study\s+abroad/i, /pass\s+exam/i],
      priority: 8,
    },
    {
      intent: 'HEALTH',
      keywords: ['health', 'disease', 'illness', 'surgery', 'vitality', 'doctor', 'pain', 'hospital', 'injury', 'mental health', 'depression', 'anxiety', 'diet', 'cure', 'recovery'],
      patterns: [/health\s+issue/i, /medical\s+problem/i, /recovery\s+time/i, /will\s+i\s+get\s+better/i],
      priority: 8,
    },
    {
      intent: 'CHILDREN',
      keywords: ['child', 'children', 'baby', 'pregnant', 'pregnancy', 'son', 'daughter', 'progeny', 'conceive', 'conception', 'santan'],
      patterns: [/child\s+birth/i, /have\s+a\s+baby/i, /when\s+will\s+i\s+conceive/i],
      priority: 8,
    },
    {
      intent: 'TRAVEL',
      keywords: ['travel', 'abroad', 'foreign', 'visa', 'relocation', 'immigration', 'pr', 'relocate', 'foreign settlement', 'green card'],
      patterns: [/foreign\s+travel/i, /settle\s+abroad/i, /get\s+visa/i, /move\s+abroad/i],
      priority: 7,
    },
    {
      intent: 'SPIRITUALITY',
      keywords: ['spiritual', 'spirituality', 'meditation', 'god', 'moksha', 'guru', 'temple', 'dharma', 'puja', 'mantra', 'kundalini', 'enlightenment', 'past life', 'karma'],
      patterns: [/spiritual\s+path/i, /past\s+life/i, /my\s+dharma/i, /purpose\s+of\s+life/i],
      priority: 7,
    },
    {
      intent: 'DASHA',
      keywords: ['dasha', 'mahadasha', 'antardasha', 'pratyantardasha', 'period', 'running period', 'time period', 'cycle'],
      patterns: [/which\s+dasha/i, /current\s+dasha/i, /next\s+dasha/i, /dasha\s+effect/i],
      priority: 7,
    },
    {
      intent: 'TRANSIT',
      keywords: ['transit', 'transits', 'gochar', 'sade sati', 'sadesati', 'shani', 'kantaka', 'ashtama', 'saturn transit', 'jupiter transit', 'rahu transit', 'ketu transit'],
      patterns: [/sade\s+sati/i, /current\s+transit/i, /saturn\s+moving/i, /jupiter\s+moving/i],
      priority: 7,
    },
    {
      intent: 'YOGA',
      keywords: ['yoga', 'yogas', 'raja yoga', 'dhana yoga', 'gajakesari', 'mahapurusha', 'ruchaka', 'bhadra', 'hamsa', 'malavya', 'sasa', 'neecha bhanga', 'vipareeta'],
      patterns: [/which\s+yogas/i, /special\s+yogas/i, /royal\s+yoga/i, /wealth\s+yoga/i, /\b(gajakesari|gaja\s+kesari|mahapurusha|raja\s+yoga|dhana\s+yoga)\b/i, /yoga(s)?\s+in\s+(my\s+)?(chart|kundli|horoscope)/i],
      priority: 8,
    },
    {
      intent: 'REMEDY',
      keywords: ['remedy', 'remedies', 'upaya', 'gemstone', 'rudraksha', 'fasting', 'mantra', 'daan', 'donation', 'puja', 'yantra', 'pacify'],
      patterns: [/what\s+(.*?)remed(y|ies)/i, /any\s+remed(y|ies)/i, /which\s+gemstone/i, /which\s+rudraksha/i, /how\s+to\s+pacify/i, /\bremed(y|ies)\b/i, /\bpacify\b/i],
      priority: 9,
    },
    {
      intent: 'DIVISIONAL_CHART',
      keywords: ['navamsha', 'navamsa', 'dashamsha', 'dashamsa', 'varga', 'divisional', 'd9', 'd10', 'd2', 'd3', 'd4', 'd7', 'd12', 'd16', 'd20', 'd24', 'd27', 'd30', 'd40', 'd45', 'd60'],
      patterns: [/in\s+d9/i, /in\s+d10/i, /in\s+navamsha/i, /in\s+dashamsha/i, /divisional\s+chart/i],
      priority: 7,
    },
    {
      intent: 'KUNDLI',
      keywords: ['kundli', 'chart', 'horoscope', 'ascendant', 'lagna', 'rashi', 'birth chart', 'planetary positions'],
      patterns: [/my\s+kundli/i, /my\s+chart/i, /my\s+lagna/i, /my\s+ascendant/i, /my\s+rashi/i],
      priority: 5,
    },
  ];

  /**
   * Classifies user input text into a deterministic AstrologyIntent with a confidence score.
   */
  public static classify(text: string): { intent: AstrologyIntent; confidence: number } {
    if (!text || text.trim().length === 0) {
      return { intent: 'GENERAL', confidence: 0.5 };
    }

    const normalized = text.toLowerCase().trim();

    // 1. Check patterns (highest specificity)
    for (const rule of this.RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(normalized)) {
          return { intent: rule.intent, confidence: 0.95 };
        }
      }
    }

    // 2. Score keyword matches
    const words = normalized.split(/\W+/).filter(Boolean);
    let bestIntent: AstrologyIntent = 'GENERAL';
    let bestScore = 0;

    for (const rule of this.RULES) {
      let matchedCount = 0;
      for (const keyword of rule.keywords) {
        if (keyword.includes(' ')) {
          if (normalized.includes(keyword)) {
            matchedCount += 2;
          }
        } else if (words.includes(keyword)) {
          matchedCount += 1;
        }
      }

      if (matchedCount > 0) {
        const weightedScore = matchedCount * rule.priority;
        if (weightedScore > bestScore) {
          bestScore = weightedScore;
          bestIntent = rule.intent;
        }
      }
    }

    if (bestScore > 0) {
      const normalizedConfidence = Math.min(0.9, 0.5 + bestScore * 0.05);
      return { intent: bestIntent, confidence: normalizedConfidence };
    }

    return { intent: 'GENERAL', confidence: 0.5 };
  }
}
