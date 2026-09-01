import { PlanetName } from '../../astrology/types/astrology';

export interface VedicRemedy {
  planet: PlanetName;
  type: 'mantra' | 'charity' | 'lifestyle' | 'meditation' | 'rudraksha';
  title: string;
  description: string;
  traditionalRationale: string;
  safetyNote: string;
}

export class RemedyEngine {
  private static readonly PLANETARY_REMEDIES: Record<PlanetName, VedicRemedy[]> = {
    Sun: [
      {
        planet: 'Sun',
        type: 'lifestyle',
        title: 'Surya Namaskar & Morning Solar Salutation',
        description: 'Practice morning sunlight exposure and Surya Namaskar at dawn to strengthen solar vitality.',
        traditionalRationale: 'Enhances Tejas (radiance), confidence, and leadership energy.',
        safetyNote: 'Ensure comfortable posture; avoid looking directly at intense mid-day sun.',
      },
      {
        planet: 'Sun',
        type: 'mantra',
        title: 'Gayatri Mantra or Surya Beej Mantra',
        description: 'Chant "Om Hram Hreem Hroum Sah Suryaya Namah" 108 times on Sunday mornings.',
        traditionalRationale: 'Purifies inner ego and illuminates moral clarity.',
        safetyNote: 'Mantra chanting is peaceful and non-invasive.',
      },
      {
        planet: 'Sun',
        type: 'charity',
        title: 'Donation of Whole Wheat or Jaggery',
        description: 'Offer whole wheat grains, jaggery, or copper utensils to elders or spiritual seekers on Sundays.',
        traditionalRationale: 'Balances Sun energy by sharing abundance and honoring father figures.',
        safetyNote: 'Donate within your natural means.',
      },
    ],
    Moon: [
      {
        planet: 'Moon',
        type: 'lifestyle',
        title: 'Water Mindfulness & Mother Care',
        description: 'Stay well-hydrated, practice calming evening breathwork, and honor maternal figures.',
        traditionalRationale: 'Nourishes Manas (emotional mind) and deep psychological peace.',
        safetyNote: 'Promotes restorative hydration and sleep hygiene.',
      },
      {
        planet: 'Moon',
        type: 'mantra',
        title: 'Chandra Beej Mantra',
        description: 'Chant "Om Shram Shreem Shroum Sah Chandramase Namah" on Monday evenings.',
        traditionalRationale: 'Soothes restless emotional states and anxiety.',
        safetyNote: 'Peaceful mental contemplation.',
      },
      {
        planet: 'Moon',
        type: 'charity',
        title: 'Donation of Rice, Milk, or White Clothes',
        description: 'Offer rice or clean white garments to those in need on Mondays.',
        traditionalRationale: 'Cultivates unconditional lunar compassion and emotional balance.',
        safetyNote: 'Simple charitable act.',
      },
    ],
    Mars: [
      {
        planet: 'Mars',
        type: 'lifestyle',
        title: 'Constructive Physical Discipline',
        description: 'Channel fiery Martian prana into structured fitness, martial arts, or sports.',
        traditionalRationale: 'Directs Mangal drive away from impulsive anger toward focused achievement.',
        safetyNote: 'Avoid over-exertion; maintain healthy athletic limits.',
      },
      {
        planet: 'Mars',
        type: 'mantra',
        title: 'Hanuman Chalisa or Mangal Beej Mantra',
        description: 'Recite the Hanuman Chalisa on Tuesdays to cultivate courage and protection.',
        traditionalRationale: 'Purifies the warrior spirit with selfless devotion.',
        safetyNote: 'Traditional devotional recitation.',
      },
      {
        planet: 'Mars',
        type: 'charity',
        title: 'Donation of Red Lentils (Masoor Dal)',
        description: 'Distribute red lentils or warm meals to community workers on Tuesdays.',
        traditionalRationale: 'Pacifies fiery planetary afflictions and balances Kuja Dosha.',
        safetyNote: 'Safe and supportive charitable offering.',
      },
    ],
    Mercury: [
      {
        planet: 'Mercury',
        type: 'lifestyle',
        title: 'Green Nature Walks & Continuous Learning',
        description: 'Spend time in nature, read uplifting literature, and maintain structured journaling.',
        traditionalRationale: 'Enhances Buddhi (intellect), speech clarity, and commerce skills.',
        safetyNote: 'Gentle mental enrichment.',
      },
      {
        planet: 'Mercury',
        type: 'mantra',
        title: 'Budha Beej Mantra',
        description: 'Chant "Om Bram Breem Broum Sah Budhaya Namah" on Wednesdays.',
        traditionalRationale: 'Stimulates neural coherence and eloquence.',
        safetyNote: 'Non-invasive vocal/mental recitation.',
      },
      {
        planet: 'Mercury',
        type: 'charity',
        title: 'Supporting Student Education & Green Mung Dal',
        description: 'Donate books, stationery to students, or feed green grass to cows on Wednesdays.',
        traditionalRationale: 'Invokes Mercury blessings for academic and trade success.',
        safetyNote: 'Positive educational charity.',
      },
    ],
    Jupiter: [
      {
        planet: 'Jupiter',
        type: 'lifestyle',
        title: 'Honoring Teachers & Philosophical Study',
        description: 'Seek guidance from ethical mentors and study sacred or uplifting philosophy.',
        traditionalRationale: 'Expands Guru prasad (wisdom, fortune, and moral grace).',
        safetyNote: 'Fosters intellectual expansion and ethical living.',
      },
      {
        planet: 'Jupiter',
        type: 'mantra',
        title: 'Guru Beej Mantra',
        description: 'Chant "Om Gram Greem Groum Sah Gurave Namah" on Thursdays.',
        traditionalRationale: 'Awakens higher discernment and divine grace.',
        safetyNote: 'Meditative contemplation.',
      },
      {
        planet: 'Jupiter',
        type: 'charity',
        title: 'Donation of Chana Dal, Turmeric, or Books',
        description: 'Offer yellow lentils, turmeric, or educational texts to teachers or community centers on Thursdays.',
        traditionalRationale: 'Strengthens Jupiter wealth, children, and spiritual knowledge.',
        safetyNote: 'Wholesome educational philanthropy.',
      },
    ],
    Venus: [
      {
        planet: 'Venus',
        type: 'lifestyle',
        title: 'Aesthetic Harmony & Respecting Women',
        description: 'Maintain clean, fragrant living spaces and honor women and artists in your environment.',
        traditionalRationale: 'Enhances Shukra vitality, artistic creativity, and marital sweetness.',
        safetyNote: 'Encourages respectful social conduct.',
      },
      {
        planet: 'Venus',
        type: 'mantra',
        title: 'Shukra Beej Mantra',
        description: 'Chant "Om Dram Dreem Droum Sah Shukraya Namah" on Friday mornings.',
        traditionalRationale: 'Harmonizes relationship energies and refined creative talents.',
        safetyNote: 'Devotional recitation.',
      },
      {
        planet: 'Venus',
        type: 'charity',
        title: 'Donation of Sugar, Ghee, or Silk Garments',
        description: 'Donate white sweets, cooking oil, or clothing to women in need on Fridays.',
        traditionalRationale: 'Cultivates graciousness and attracts relationship prosperity.',
        safetyNote: 'Safe charitable gifting.',
      },
    ],
    Saturn: [
      {
        planet: 'Saturn',
        type: 'lifestyle',
        title: 'Humility, Routine & Serving the Underprivileged',
        description: 'Embrace steady routines, patience, and serve labor workers, cleaners, and the aged.',
        traditionalRationale: 'Pleases Shani Deva by burning karmic pride through humility and hard work.',
        safetyNote: 'Encourages ethical social service and patience.',
      },
      {
        planet: 'Saturn',
        type: 'mantra',
        title: 'Shani Gayatri or Mahamrityunjaya Mantra',
        description: 'Chant the Mahamrityunjaya Mantra or "Om Sham Shanaischaraya Namah" on Saturdays.',
        traditionalRationale: 'Protects from Sade Sati anxieties and grants stoic perseverance.',
        safetyNote: 'Calming meditative repetition.',
      },
      {
        planet: 'Saturn',
        type: 'charity',
        title: 'Donation of Black Sesame, Mustard Oil, or Warm Blankets',
        description: 'Offer mustard oil, sesame seeds, or warm footwear/blankets to laborers on Saturdays.',
        traditionalRationale: 'Directly alleviates Saturn transit adversities through selfless service.',
        safetyNote: 'Impactful community service.',
      },
    ],
    Rahu: [
      {
        planet: 'Rahu',
        type: 'lifestyle',
        title: 'Clarity of Mind & Avoiding Intoxicants',
        description: 'Practice grounding breathwork, avoid confusing illusions, and maintain clean living.',
        traditionalRationale: 'Stabilizes Rahu obsessive obsessions into visionary innovation.',
        safetyNote: 'Promotes sobriety and mental clarity.',
      },
      {
        planet: 'Rahu',
        type: 'mantra',
        title: 'Rahu Beej Mantra or Durga Saptashati',
        description: 'Chant "Om Bhram Bhreem Bhroum Sah Rahave Namah" during evening twilight.',
        traditionalRationale: 'Shields against deceptive illusions and sudden anxieties.',
        safetyNote: 'Spiritual grounding.',
      },
      {
        planet: 'Rahu',
        type: 'charity',
        title: 'Feeding Stray Dogs & Donating Blue/Black Blankets',
        description: 'Feed stray animals and assist sweepers with essential supplies on Wednesdays/Saturdays.',
        traditionalRationale: 'Pacifies erratic karmic patterns.',
        safetyNote: 'Kindness to animals.',
      },
    ],
    Ketu: [
      {
        planet: 'Ketu',
        type: 'lifestyle',
        title: 'Vipassana Meditation & Solitude',
        description: 'Dedicate quiet time for solitary introspection and spiritual reading.',
        traditionalRationale: 'Elevates Ketu detachment into profound spiritual liberation (Moksha).',
        safetyNote: 'Mindful peaceful reflection.',
      },
      {
        planet: 'Ketu',
        type: 'mantra',
        title: 'Ganesha Atharvashirsha or Ketu Beej Mantra',
        description: 'Chant "Om Kem Ketave Namah" or pray to Lord Ganesha to remove hidden obstacles.',
        traditionalRationale: 'Dissolves karmic knots and clears spiritual blockages.',
        safetyNote: 'Devotional prayer.',
      },
      {
        planet: 'Ketu',
        type: 'charity',
        title: 'Donation of Multi-Colored Blankets or Sesame Laddoos',
        description: 'Offer blankets or wholesome food to spiritual hermits or orphanages.',
        traditionalRationale: 'Neutralizes sudden spiritual isolation.',
        safetyNote: 'Supportive community giving.',
      },
    ],
  };

  /**
   * Retrieves safe, culturally grounded remedies for specific planets or active dasha periods.
   */
  public static getRemediesForPlanets(planets: PlanetName[]): VedicRemedy[] {
    const list: VedicRemedy[] = [];
    for (const p of planets) {
      const rems = this.PLANETARY_REMEDIES[p];
      if (rems) {
        list.push(...rems);
      }
    }
    return list;
  }
}
