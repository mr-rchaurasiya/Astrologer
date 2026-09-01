import { IBirthProfile } from '../../models/BirthProfile';
import { AstrologyChartOutput, PlanetName } from '../../astrology/types/astrology';
import { AstrologyAIContext, PointContext, SanitizedProfileDTO } from '../types/ai';

export const ASTROLOGY_CONTEXT_VERSION = '1.0';

export class ContextBuilder {
  /**
   * Constructs a minimal, sanitized, strongly typed astrology context for AI consultation.
   */
  public static buildContext(
    profile: IBirthProfile,
    chart: AstrologyChartOutput,
    pointContext?: PointContext,
    userMemories?: Array<{ category: string; key: string; value: string }>
  ): AstrologyAIContext {
    // 1. Sanitize Profile DTO (No sensitive IDs, hashes, or security fields)
    const sanitizedProfile: SanitizedProfileDTO = {
      name: profile.name,
      relationship: profile.relationship,
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      placeName: profile.placeName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
    };

    // 2. Lagna Lord
    const lagnaLord = chart.houses.find((h) => h.houseNumber === 1)?.lord || ('Sun' as PlanetName);

    // 3. Find active Dasha
    const now = new Date();
    let activeMaha = '';
    let activeAntar = '';
    let activePrat = '';

    for (const m of chart.dashas.mahadashas) {
      const mStart = new Date(m.startDate);
      const mEnd = new Date(m.endDate);
      if (now >= mStart && now <= mEnd) {
        activeMaha = m.lord;
        if (m.subPeriods) {
          for (const a of m.subPeriods) {
            const aStart = new Date(a.startDate);
            const aEnd = new Date(a.endDate);
            if (now >= aStart && now <= aEnd) {
              activeAntar = a.lord;
              if (a.subPeriods) {
                for (const p of a.subPeriods) {
                  const pStart = new Date(p.startDate);
                  const pEnd = new Date(p.endDate);
                  if (now >= pStart && now <= pEnd) {
                    activePrat = p.lord;
                    break;
                  }
                }
              }
              break;
            }
          }
        }
        break;
      }
    }

    // 4. Resolve Highlighted Point if present (Point & Ask)
    let highlightedPoint: AstrologyAIContext['highlightedPoint'] = undefined;
    if (pointContext) {
      highlightedPoint = this.resolvePointContext(pointContext, chart);
    }

    // 5. Construct full context
    return {
      contextVersion: ASTROLOGY_CONTEXT_VERSION,
      profile: sanitizedProfile,
      ayanamsa: {
        system: chart.ayanamsa.system,
        formatted: chart.ayanamsa.formatted,
      },
      ascendant: {
        sign: chart.ascendant.sign,
        degree: parseFloat(chart.ascendant.signDegree.toFixed(2)),
        nakshatra: chart.ascendant.nakshatra,
        pada: chart.ascendant.pada,
        lord: lagnaLord,
      },
      planets: chart.planets.map((p) => ({
        name: p.name,
        sign: p.sign,
        degree: parseFloat(p.signDegree.toFixed(2)),
        house: p.house,
        nakshatra: p.nakshatra,
        pada: p.pada,
        speed: parseFloat(p.speed.toFixed(4)),
        retrograde: p.retrograde,
        combust: p.combust,
        dignity: p.dignity,
      })),
      houses: chart.houses.map((h) => ({
        houseNumber: h.houseNumber,
        sign: h.sign,
        lord: h.lord,
        occupants: h.occupants,
      })),
      divisionalCharts: {
        d1: chart.divisionalCharts.d1.placements.map((p) => ({
          planet: p.planet,
          sign: p.sign,
          house: p.house,
        })),
        d9: chart.divisionalCharts.d9.placements.map((p) => ({
          planet: p.planet,
          sign: p.sign,
          house: p.house,
        })),
        d10: chart.divisionalCharts.d10.placements.map((p) => ({
          planet: p.planet,
          sign: p.sign,
          house: p.house,
        })),
      },
      aspects: chart.aspects,
      activeDasha: activeMaha
        ? {
            mahadasha: activeMaha,
            antardasha: activeAntar || undefined,
            pratyantardasha: activePrat || undefined,
          }
        : undefined,
      panchangSummary: {
        tithi: `${chart.panchang.tithi.name} (${chart.panchang.tithi.paksha} Paksha)`,
        vara: chart.panchang.vara.name,
        nakshatra: `${chart.panchang.nakshatra.name} (Lord: ${chart.panchang.nakshatra.lord})`,
        yoga: chart.panchang.yoga.name,
        karana: chart.panchang.karana.name,
      },
      highlightedPoint,
      userMemories,
    };
  }

  /**
   * Resolves Point & Ask target from authoritative backend calculation.
   */
  private static resolvePointContext(
    pointContext: PointContext,
    chart: AstrologyChartOutput
  ): { type: PointContext['type']; id: string; details: any } {
    const { type, id } = pointContext;

    switch (type) {
      case 'planet': {
        const planet = chart.planets.find(
          (p) => p.name.toLowerCase() === id.toLowerCase()
        );
        const aspectsCast = chart.aspects.filter(
          (a) => a.fromPlanet.toLowerCase() === id.toLowerCase()
        );
        const aspectsReceived = chart.aspects.filter(
          (a) => a.targetPlanet && a.targetPlanet.toLowerCase() === id.toLowerCase()
        );

        return {
          type: 'planet',
          id,
          details: {
            planetData: planet || null,
            aspectsCast,
            aspectsReceived,
          },
        };
      }

      case 'house': {
        const houseNum = parseInt(id, 10);
        const house = chart.houses.find((h) => h.houseNumber === houseNum);
        const aspectsHittingHouse = chart.aspects.filter((a) => a.toHouse === houseNum);

        return {
          type: 'house',
          id,
          details: {
            houseData: house || null,
            aspectsHittingHouse,
          },
        };
      }

      case 'nakshatra': {
        const moon = chart.planets.find((p) => p.name === 'Moon');
        return {
          type: 'nakshatra',
          id,
          details: {
            nakshatraName: moon?.nakshatra || id,
            pada: moon?.pada,
            lord: moon?.nakshatraLord,
            moonSign: moon?.sign,
            moonDegree: moon?.signDegree,
          },
        };
      }

      case 'dasha': {
        return {
          type: 'dasha',
          id,
          details: {
            requestedPeriod: id,
            balanceAtBirth: chart.dashas.balanceAtBirthYears,
            mahadashasSummary: chart.dashas.mahadashas.map((m) => ({
              lord: m.lord,
              start: m.startDate.split('T')[0],
              end: m.endDate.split('T')[0],
              durationYears: m.durationYears,
            })),
          },
        };
      }

      case 'chart':
      default: {
        return {
          type: 'chart',
          id,
          details: {
            chartType: id,
            ascendant: chart.ascendant,
          },
        };
      }
    }
  }
}
