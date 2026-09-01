import {
  PlanetName,
  PlanetPosition,
  HouseInfo,
  AscendantInfo,
  YogaResult,
  YogaCategory,
} from '../types/astrology';
import { getSignByNumber } from '../zodiac/signs';

export class YogaDetector {
  /**
   * Evaluates all classical Vedic Yogas from calculated chart elements
   */
  public static detectAllYogas(
    ascendant: AscendantInfo,
    planets: PlanetPosition[],
    houses: HouseInfo[]
  ): YogaResult[] {
    const results: YogaResult[] = [];

    const getPlanet = (name: PlanetName) => planets.find((p) => p.name === name)!;
    const sun = getPlanet('Sun');
    const moon = getPlanet('Moon');
    const mars = getPlanet('Mars');
    const mercury = getPlanet('Mercury');
    const jupiter = getPlanet('Jupiter');
    const venus = getPlanet('Venus');
    const saturn = getPlanet('Saturn');
    const rahu = getPlanet('Rahu');
    const ketu = getPlanet('Ketu');

    // House Lord helper
    const getHouseLord = (houseNum: number): PlanetName => {
      const h = houses.find((x) => x.houseNumber === houseNum);
      return h ? h.lord : 'Sun';
    };

    // House from Moon helper
    const getHouseFromMoon = (targetHouse: number): number => {
      return ((targetHouse - moon.house + 12) % 12) + 1;
    };

    // ------------------------------------------------------------------------
    // 1. Gaja Kesari Yoga (Jupiter in Kendra from Moon: 1, 4, 7, 10)
    // ------------------------------------------------------------------------
    const jupFromMoon = getHouseFromMoon(jupiter.house);
    if ([1, 4, 7, 10].includes(jupFromMoon)) {
      const isExaltedOrOwn = ['Cancer', 'Sagittarius', 'Pisces'].includes(jupiter.sign);
      results.push({
        yogaId: 'gaja_kesari_yoga',
        name: 'Gaja Kesari Yoga',
        category: 'Raja Yoga',
        detected: true,
        strength: isExaltedOrOwn ? 'High' : 'Medium',
        conditions: [
          `Jupiter is in the ${jupFromMoon}${jupFromMoon === 1 ? 'st' : jupFromMoon === 4 ? 'th' : jupFromMoon === 7 ? 'th' : 'th'} house (Kendra) from the Moon.`,
          `Jupiter is placed in ${jupiter.sign} (House ${jupiter.house}).`,
        ],
        explanation:
          'Bestows wisdom, leadership, public respect, enduring reputation, and triumph over adversities.',
        supportingPlanets: ['Jupiter', 'Moon'],
        supportingHouses: [jupiter.house, moon.house],
      });
    }

    // ------------------------------------------------------------------------
    // 2. Budha-Aditya Yoga (Sun + Mercury Conjunction)
    // ------------------------------------------------------------------------
    if (sun.house === mercury.house) {
      const dist = Math.abs(sun.longitude - mercury.longitude);
      const isCombust = dist < 3.0;
      results.push({
        yogaId: 'budha_aditya_yoga',
        name: 'Budha-Aditya Yoga',
        category: 'Solar/Lunar Yoga',
        detected: true,
        strength: isCombust ? 'Medium' : 'High',
        conditions: [
          `Sun and Mercury are conjunct in ${sun.sign} (House ${sun.house}).`,
          `Separation: ${dist.toFixed(2)}° (${isCombust ? 'combust' : 'uncombust'}).`,
        ],
        explanation:
          'Sharp intellect, administrative acumen, articulate speech, and strong analytical capacity.',
        supportingPlanets: ['Sun', 'Mercury'],
        supportingHouses: [sun.house],
      });
    }

    // ------------------------------------------------------------------------
    // 3. Chandra-Mangal Yoga (Moon + Mars Conjunction or 7th aspect)
    // ------------------------------------------------------------------------
    const isMoonMarsConjunct = moon.house === mars.house;
    const isMoonMarsMutual7th = Math.abs(moon.house - mars.house) === 6;
    if (isMoonMarsConjunct || isMoonMarsMutual7th) {
      results.push({
        yogaId: 'chandra_mangal_yoga',
        name: 'Chandra-Mangal Yoga',
        category: 'Dhana Yoga',
        detected: true,
        strength: 'High',
        conditions: [
          isMoonMarsConjunct
            ? `Moon and Mars are conjunct in ${moon.sign} (House ${moon.house}).`
            : `Moon (House ${moon.house}) and Mars (House ${mars.house}) are in mutual 7th aspect.`,
        ],
        explanation:
          'Enterprise, strong financial drive, commercial success, property accumulation, and resilience.',
        supportingPlanets: ['Moon', 'Mars'],
        supportingHouses: [moon.house, mars.house],
      });
    }

    // ------------------------------------------------------------------------
    // 4. Pancha Mahapurusha Yogas (Mars, Mercury, Jupiter, Venus, Saturn in Kendra + Own/Exalted)
    // ------------------------------------------------------------------------
    const kendras = [1, 4, 7, 10];

    // Ruchaka (Mars)
    if (kendras.includes(mars.house) && ['Aries', 'Scorpio', 'Capricorn'].includes(mars.sign)) {
      results.push({
        yogaId: 'ruchaka_yoga',
        name: 'Ruchaka Yoga (Pancha Mahapurusha)',
        category: 'Mahapurusha Yoga',
        detected: true,
        strength: 'High',
        conditions: [`Mars is placed in ${mars.sign} in Kendra House ${mars.house}.`],
        explanation: 'Courage, physical vitality, command over land/property, executive authority, and valor.',
        supportingPlanets: ['Mars'],
        supportingHouses: [mars.house],
      });
    }

    // Bhadra (Mercury)
    if (kendras.includes(mercury.house) && ['Gemini', 'Virgo'].includes(mercury.sign)) {
      results.push({
        yogaId: 'bhadra_yoga',
        name: 'Bhadra Yoga (Pancha Mahapurusha)',
        category: 'Mahapurusha Yoga',
        detected: true,
        strength: 'High',
        conditions: [`Mercury is placed in ${mercury.sign} in Kendra House ${mercury.house}.`],
        explanation: 'Brilliant intellectual faculty, commercial mastery, eloquence, longevity, and scholarship.',
        supportingPlanets: ['Mercury'],
        supportingHouses: [mercury.house],
      });
    }

    // Hamsa (Jupiter)
    if (kendras.includes(jupiter.house) && ['Sagittarius', 'Pisces', 'Cancer'].includes(jupiter.sign)) {
      results.push({
        yogaId: 'hamsa_yoga',
        name: 'Hamsa Yoga (Pancha Mahapurusha)',
        category: 'Mahapurusha Yoga',
        detected: true,
        strength: 'High',
        conditions: [`Jupiter is placed in ${jupiter.sign} in Kendra House ${jupiter.house}.`],
        explanation: 'Virtuous character, spiritual wisdom, noble stature, universal goodwill, and prosperity.',
        supportingPlanets: ['Jupiter'],
        supportingHouses: [jupiter.house],
      });
    }

    // Malavya (Venus)
    if (kendras.includes(venus.house) && ['Taurus', 'Libra', 'Pisces'].includes(venus.sign)) {
      results.push({
        yogaId: 'malavya_yoga',
        name: 'Malavya Yoga (Pancha Mahapurusha)',
        category: 'Mahapurusha Yoga',
        detected: true,
        strength: 'High',
        conditions: [`Venus is placed in ${venus.sign} in Kendra House ${venus.house}.`],
        explanation: 'Artistic refinement, luxurious vehicles, magnetic charm, marital joy, and affluence.',
        supportingPlanets: ['Venus'],
        supportingHouses: [venus.house],
      });
    }

    // Sasa (Saturn)
    if (kendras.includes(saturn.house) && ['Capricorn', 'Aquarius', 'Libra'].includes(saturn.sign)) {
      results.push({
        yogaId: 'sasa_yoga',
        name: 'Sasa Yoga (Pancha Mahapurusha)',
        category: 'Mahapurusha Yoga',
        detected: true,
        strength: 'High',
        conditions: [`Saturn is placed in ${saturn.sign} in Kendra House ${saturn.house}.`],
        explanation: 'Command over masses, enduring power, organizational leadership, perseverance, and long-term legacy.',
        supportingPlanets: ['Saturn'],
        supportingHouses: [saturn.house],
      });
    }

    // ------------------------------------------------------------------------
    // 5. Dharma-Karmadhipati Yoga (9th Lord + 10th Lord Association)
    // ------------------------------------------------------------------------
    const lord9 = getHouseLord(9);
    const lord10 = getHouseLord(10);
    const p9 = getPlanet(lord9);
    const p10 = getPlanet(lord10);
    if (p9 && p10 && (p9.house === p10.house || Math.abs(p9.house - p10.house) === 6)) {
      results.push({
        yogaId: 'dharma_karmadhipati_yoga',
        name: 'Dharma-Karmadhipati Yoga',
        category: 'Raja Yoga',
        detected: true,
        strength: 'High',
        conditions: [
          `9th Lord (${lord9}) and 10th Lord (${lord10}) are associated in House ${p9.house}.`,
        ],
        explanation:
          'Highest class Raja Yoga combining righteous purpose (Dharma) with powerful worldly achievement (Karma).',
        supportingPlanets: [lord9, lord10],
        supportingHouses: [p9.house, p10.house],
      });
    }

    // ------------------------------------------------------------------------
    // 6. Vipareeta Raja Yogas (Harsha, Sarala, Vimala)
    // ------------------------------------------------------------------------
    const trikHouses = [6, 8, 12];
    const lord6 = getHouseLord(6);
    const lord8 = getHouseLord(8);
    const lord12 = getHouseLord(12);

    const pLord6 = getPlanet(lord6);
    const pLord8 = getPlanet(lord8);
    const pLord12 = getPlanet(lord12);

    if (pLord6 && trikHouses.includes(pLord6.house)) {
      results.push({
        yogaId: 'harsha_yoga',
        name: 'Harsha Yoga (Vipareeta Raja Yoga)',
        category: 'Vipareeta Raja Yoga',
        detected: true,
        strength: 'Medium',
        conditions: [`6th Lord (${lord6}) is placed in Dusthana House ${pLord6.house}.`],
        explanation: 'Overcomes competitors, enjoys robust immunity, freedom from debt, and rises from challenging situations.',
        supportingPlanets: [lord6],
        supportingHouses: [pLord6.house],
      });
    }

    if (pLord8 && trikHouses.includes(pLord8.house)) {
      results.push({
        yogaId: 'sarala_yoga',
        name: 'Sarala Yoga (Vipareeta Raja Yoga)',
        category: 'Vipareeta Raja Yoga',
        detected: true,
        strength: 'Medium',
        conditions: [`8th Lord (${lord8}) is placed in Dusthana House ${pLord8.house}.`],
        explanation: 'Long lifespan, fearless disposition, hidden wealth gains, and prosperity through sudden transformations.',
        supportingPlanets: [lord8],
        supportingHouses: [pLord8.house],
      });
    }

    if (pLord12 && trikHouses.includes(pLord12.house)) {
      results.push({
        yogaId: 'vimala_yoga',
        name: 'Vimala Yoga (Vipareeta Raja Yoga)',
        category: 'Vipareeta Raja Yoga',
        detected: true,
        strength: 'Medium',
        conditions: [`12th Lord (${lord12}) is placed in Dusthana House ${pLord12.house}.`],
        explanation: 'Prudent expenditures, spiritual detachment, independent lifestyle, and noble character.',
        supportingPlanets: [lord12],
        supportingHouses: [pLord12.house],
      });
    }

    // ------------------------------------------------------------------------
    // 7. Neecha Bhanga Raja Yoga (Cancellation of Debilitation)
    // ------------------------------------------------------------------------
    const debilitatedPlanets = planets.filter((p) => p.dignity === 'debilitated');
    for (const debPlanet of debilitatedPlanets) {
      // Dispositor in Kendra from Lagna or Moon
      const signInfo = getSignByNumber(debPlanet.signNumber);
      const dispositor = getPlanet(signInfo.lord);
      if (dispositor && (kendras.includes(dispositor.house) || kendras.includes(getHouseFromMoon(dispositor.house)))) {
        results.push({
          yogaId: `neecha_bhanga_${debPlanet.name.toLowerCase()}`,
          name: `Neecha Bhanga Raja Yoga (${debPlanet.name})`,
          category: 'Neecha Bhanga',
          detected: true,
          strength: 'High',
          conditions: [
            `${debPlanet.name} is debilitated in ${debPlanet.sign}.`,
            `Dispositor ${dispositor.name} is in Kendra (House ${dispositor.house}).`,
          ],
          explanation:
            `Initial hardships associated with ${debPlanet.name} convert into extraordinary resilience, authority, and ultimate success.`,
          supportingPlanets: [debPlanet.name, dispositor.name],
          supportingHouses: [debPlanet.house, dispositor.house],
        });
      }
    }

    // ------------------------------------------------------------------------
    // 8. Amala Yoga (Benefic in 10th from Lagna or Moon)
    // ------------------------------------------------------------------------
    const h10 = houses.find((h) => h.houseNumber === 10);
    const h10Benefics = h10?.occupants.filter((p) => ['Jupiter', 'Venus', 'Mercury'].includes(p)) || [];
    if (h10Benefics.length > 0) {
      results.push({
        yogaId: 'amala_yoga',
        name: 'Amala Yoga',
        category: 'Auspicious Yoga',
        detected: true,
        strength: 'High',
        conditions: [`Benefic planet (${h10Benefics.join(', ')}) occupies the 10th House.`],
        explanation: 'Spotless professional reputation, philanthropic inclination, and enduring fame.',
        supportingPlanets: h10Benefics as PlanetName[],
        supportingHouses: [10],
      });
    }

    // ------------------------------------------------------------------------
    // 9. Lakshmi Yoga (9th Lord in Kendra/Trikona in Own/Exalted sign)
    // ------------------------------------------------------------------------
    const lagnaLord = getHouseLord(1);
    const pLagna = getPlanet(lagnaLord);
    if (
      p9 &&
      (kendras.includes(p9.house) || [1, 5, 9].includes(p9.house)) &&
      ['exalted', 'own'].includes(p9.dignity) &&
      pLagna &&
      !['debilitated'].includes(pLagna.dignity)
    ) {
      results.push({
        yogaId: 'lakshmi_yoga',
        name: 'Lakshmi Yoga',
        category: 'Dhana Yoga',
        detected: true,
        strength: 'High',
        conditions: [
          `9th Lord (${lord9}) is in auspicious dignity (${p9.dignity}) in House ${p9.house}.`,
          `Lagna Lord (${lagnaLord}) is well-placed.`,
        ],
        explanation: 'Abundance, moral nobility, high cultural stature, and divine grace in wealth accumulation.',
        supportingPlanets: [lord9, lagnaLord],
        supportingHouses: [p9.house, pLagna.house],
      });
    }

    // ------------------------------------------------------------------------
    // 10. Saraswati Yoga (Jupiter, Venus, Mercury in Kendra/Trikona/2nd)
    // ------------------------------------------------------------------------
    const validSaraswatiHouses = [1, 2, 4, 5, 7, 9, 10];
    if (
      validSaraswatiHouses.includes(jupiter.house) &&
      validSaraswatiHouses.includes(venus.house) &&
      validSaraswatiHouses.includes(mercury.house) &&
      ['exalted', 'own', 'friend'].includes(jupiter.dignity)
    ) {
      results.push({
        yogaId: 'saraswati_yoga',
        name: 'Saraswati Yoga',
        category: 'Auspicious Yoga',
        detected: true,
        strength: 'High',
        conditions: [
          `Jupiter (House ${jupiter.house}), Venus (House ${venus.house}), and Mercury (House ${mercury.house}) occupy Kendra/Trikona/2nd houses.`,
        ],
        explanation: 'Supreme mastery over learning, literary skills, music, poetry, debate, and spiritual wisdom.',
        supportingPlanets: ['Jupiter', 'Venus', 'Mercury'],
        supportingHouses: [jupiter.house, venus.house, mercury.house],
      });
    }

    return results;
  }
}
