import PDFDocument from 'pdfkit';
import { KundliReportData } from './report.types';
import { PlanetPosition, HouseInfo, DashaPeriod } from '../astrology/types/astrology';

export class KundliPdfGenerator {
  public static async generate(data: KundliReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const { profile, chart, dasha, panchang, transits, language, generatedDate } = data;

      // ==========================================
      // PAGE 1: COVER PAGE
      // ==========================================
      doc.rect(20, 20, 555, 802).lineWidth(2).stroke('#C89D3C');
      doc.rect(25, 25, 545, 792).lineWidth(0.5).stroke('#8B6B23');

      doc.moveDown(4);

      // Title
      doc.fillColor('#8B6B23').fontSize(14).font('Helvetica-Bold').text('VEDIC ASTROLOGY JYOTISH DOSSIER', {
        align: 'center',
        characterSpacing: 2,
      });
      doc.moveDown(0.5);
      doc.fillColor('#1A1E29').fontSize(24).font('Helvetica-Bold').text('COMPLETE KUNDLI HOROSCOPE REPORT', {
        align: 'center',
      });
      doc.moveDown(0.3);
      doc.fillColor('#64748B').fontSize(10).font('Helvetica').text('Computed with Lahiri Ayanamsa (Chitra Paksha) & Whole Sign Bhavas', {
        align: 'center',
      });

      doc.moveDown(3);

      // Native's Card
      const cardY = 220;
      doc.rect(60, cardY, 475, 240).fillAndStroke('#F8FAFC', '#E2E8F0');

      doc.fillColor('#C89D3C').fontSize(12).font('Helvetica-Bold').text('NATIVE DETAILS', 80, cardY + 20);
      doc.fillColor('#1E293B').fontSize(18).text(profile.name, 80, cardY + 40);

      doc.fontSize(10).font('Helvetica').fillColor('#475569');
      doc.text(`Date of Birth: ${profile.dateOfBirth}`, 80, cardY + 70);
      doc.text(`Time of Birth: ${profile.timeOfBirth}`, 80, cardY + 90);
      doc.text(`Place of Birth: ${profile.placeName}`, 80, cardY + 110);
      doc.text(`Coordinates: ${profile.latitude}° N, ${profile.longitude}° E`, 80, cardY + 130);
      doc.text(`Timezone: ${profile.timezone} (UTC+${profile.timezoneOffset})`, 80, cardY + 150);
      doc.text(`Ascendant (Lagna): ${chart.ascendant.sign} (${chart.ascendant.signDegree.toFixed(2)}°)`, 80, cardY + 170);

      const moon = chart.planets.find((p: PlanetPosition) => p.name === 'Moon');
      doc.text(`Moon Sign (Rashi): ${moon ? moon.sign : '—'} | Nakshatra: ${moon ? `${moon.nakshatra} (Pada ${moon.pada})` : '—'}`, 80, cardY + 190);
      doc.text(`Lahiri Ayanamsa: ${chart.ayanamsa.formatted}`, 80, cardY + 210);

      // Metadata & Footer Disclaimer
      doc.fontSize(9).fillColor('#64748B').text(`Generated Date: ${generatedDate}`, 40, 520, { align: 'center' });

      doc.rect(60, 600, 475, 140).fillAndStroke('#FFFBEB', '#FDE68A');
      doc.fillColor('#92400E').fontSize(9).font('Helvetica-Bold').text('VEDIC PHILOSOPHICAL DISCLAIMER', 80, 615);
      doc.font('Helvetica').fontSize(8).fillColor('#78350F').text(
        'This astrological report is generated using deterministic astronomical algorithms and classical Parashari Jyotish principles. Astrology provides philosophical insight, archetypal self-reflection, and karmic patterns. It does not constitute medical, legal, financial, or psychological advice. Planetary influences represent tendencies rather than absolute destinies.',
        80,
        635,
        { width: 435, lineGap: 3 }
      );

      // ==========================================
      // PAGE 2: PLANETARY POSITIONS & BHAVA TABLE
      // ==========================================
      doc.addPage();
      doc.rect(20, 20, 555, 802).lineWidth(1).stroke('#CBD5E1');

      doc.fillColor('#C89D3C').fontSize(16).font('Helvetica-Bold').text('PLANETARY PLACEMENTS & DIGNITIES', 40, 40);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('Accurate Geocentric Ephemeris positions in Sidereal Nirayana Zodiac', 40, 60);

      // Table Header
      let tableY = 85;
      doc.rect(40, tableY, 515, 20).fill('#F1F5F9');
      doc.fillColor('#1E293B').fontSize(8).font('Helvetica-Bold');
      doc.text('Planet', 50, tableY + 6);
      doc.text('Sign', 120, tableY + 6);
      doc.text('Degree', 200, tableY + 6);
      doc.text('House', 260, tableY + 6);
      doc.text('Nakshatra', 310, tableY + 6);
      doc.text('Pada', 390, tableY + 6);
      doc.text('Dignity', 430, tableY + 6);
      doc.text('State', 490, tableY + 6);

      tableY += 20;
      doc.font('Helvetica').fontSize(8);

      chart.planets.forEach((p: PlanetPosition, idx: number) => {
        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(40, tableY, 515, 18).fill('#F8FAFC');
        }
        doc.fillColor('#0F172A');
        doc.text(p.name, 50, tableY + 5);
        doc.text(p.sign, 120, tableY + 5);
        doc.text(`${p.signDegree.toFixed(2)}°`, 200, tableY + 5);
        doc.text(`H${p.house}`, 260, tableY + 5);
        doc.text(p.nakshatra, 310, tableY + 5);
        doc.text(`P${p.pada}`, 390, tableY + 5);
        doc.text(p.dignity, 430, tableY + 5);
        doc.text(p.retrograde ? 'Retrograde' : 'Direct', 490, tableY + 5);
        tableY += 18;
      });

      // 12 Bhavas Table
      tableY += 25;
      doc.fillColor('#C89D3C').fontSize(14).font('Helvetica-Bold').text('12 BHAVAS (WHOLE SIGN HOUSES)', 40, tableY);
      tableY += 20;

      doc.rect(40, tableY, 515, 20).fill('#F1F5F9');
      doc.fillColor('#1E293B').fontSize(8).font('Helvetica-Bold');
      doc.text('House', 50, tableY + 6);
      doc.text('Rashi (Sign)', 120, tableY + 6);
      doc.text('Sign Lord', 220, tableY + 6);
      doc.text('Starting Degree', 320, tableY + 6);
      doc.text('Occupants', 410, tableY + 6);

      tableY += 20;
      doc.font('Helvetica').fontSize(8);

      chart.houses.forEach((h: HouseInfo, idx: number) => {
        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(40, tableY, 515, 18).fill('#F8FAFC');
        }
        doc.fillColor('#0F172A');
        doc.text(`House ${h.houseNumber}`, 50, tableY + 5);
        doc.text(h.sign, 120, tableY + 5);
        doc.text(h.lord, 220, tableY + 5);
        doc.text(`${h.startDegree.toFixed(2)}°`, 320, tableY + 5);
        doc.text(h.occupants && h.occupants.length > 0 ? h.occupants.join(', ') : 'None', 410, tableY + 5);
        tableY += 18;
      });

      // ==========================================
      // PAGE 3: KUNDLI VECTOR CHARTS (D1 & D9)
      // ==========================================
      doc.addPage();
      doc.rect(20, 20, 555, 802).lineWidth(1).stroke('#CBD5E1');

      doc.fillColor('#C89D3C').fontSize(16).font('Helvetica-Bold').text('NORTH INDIAN KUNDLI CHARTS', 40, 40);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('Diamond & Triangular Bhava Layout (D1 Rashi & D9 Navamsha)', 40, 60);

      // Draw D1 Chart Box
      const drawKundliDiagram = (x: number, y: number, size: number, title: string) => {
        doc.rect(x, y, size, size).lineWidth(1.5).stroke('#C89D3C');
        // Diagonal lines
        doc.moveTo(x, y).lineTo(x + size, y + size).stroke('#CBD5E1');
        doc.moveTo(x + size, y).lineTo(x, y + size).stroke('#CBD5E1');
        // Inner diamond
        doc.moveTo(x + size / 2, y).lineTo(x + size, y + size / 2).lineTo(x + size / 2, y + size).lineTo(x, y + size / 2).closePath().stroke('#CBD5E1');

        doc.fillColor('#1E293B').fontSize(11).font('Helvetica-Bold').text(title, x, y - 18, { width: size, align: 'center' });

        // Center Lagna Indicator
        doc.fillColor('#C89D3C').fontSize(9).text('LAGNA', x + size / 2 - 18, y + size / 2 - 25);
      };

      drawKundliDiagram(140, 110, 310, 'D1 RASHI BIRTH CHART (Physical Reality & Karma)');
      drawKundliDiagram(140, 490, 310, 'D9 NAVAMSHA CHART (Dharmic Fruit & Relationships)');

      // ==========================================
      // PAGE 4: VIMSHOTTARI DASHA & PANCHANG
      // ==========================================
      doc.addPage();
      doc.rect(20, 20, 555, 802).lineWidth(1).stroke('#CBD5E1');

      doc.fillColor('#C89D3C').fontSize(16).font('Helvetica-Bold').text('120-YEAR VIMSHOTTARI DASHA TIMELINE', 40, 40);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('Planetary period cycles calculated from birth Moon Nakshatra balance', 40, 60);

      let dashaY = 85;
      doc.rect(40, dashaY, 515, 20).fill('#F1F5F9');
      doc.fillColor('#1E293B').fontSize(8).font('Helvetica-Bold');
      doc.text('Mahadasha Lord', 50, dashaY + 6);
      doc.text('Start Date', 160, dashaY + 6);
      doc.text('End Date', 270, dashaY + 6);
      doc.text('Duration (Years)', 380, dashaY + 6);
      doc.text('Key Life Themes', 470, dashaY + 6);

      dashaY += 20;
      doc.font('Helvetica').fontSize(8);

      dasha.mahadashas.forEach((m: DashaPeriod, idx: number) => {
        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(40, dashaY, 515, 18).fill('#F8FAFC');
        }
        doc.fillColor('#0F172A');
        doc.text(m.lord, 50, dashaY + 5);
        doc.text(m.startDate.slice(0, 10), 160, dashaY + 5);
        doc.text(m.endDate.slice(0, 10), 270, dashaY + 5);
        doc.text(`${m.durationYears.toFixed(1)} yrs`, 380, dashaY + 5);
        doc.text(`${m.subPeriods?.length || 9} Antardashas`, 470, dashaY + 5);
        dashaY += 18;
      });

      // Panchang & Muhurta Section
      dashaY += 25;
      doc.fillColor('#C89D3C').fontSize(14).font('Helvetica-Bold').text('SACRED PANCHANG & DAILY MUHURTA', 40, dashaY);
      dashaY += 20;

      doc.rect(40, dashaY, 515, 120).fillAndStroke('#F8FAFC', '#E2E8F0');
      doc.fillColor('#1E293B').fontSize(9).font('Helvetica');

      doc.text(`Tithi (Lunar Day): ${panchang.tithi.name} (Paksha: ${panchang.tithi.paksha})`, 60, dashaY + 15);
      doc.text(`Vara (Weekday): ${panchang.vara.name} (Ruler: ${panchang.vara.rulingPlanet})`, 60, dashaY + 35);
      doc.text(`Nakshatra: ${panchang.nakshatra.name} (Degree: ${panchang.nakshatra.degreeInNakshatra.toFixed(1)}°)`, 60, dashaY + 55);
      doc.text(`Yoga: ${panchang.yoga.name} | Karana: ${panchang.karana.name}`, 60, dashaY + 75);
      doc.text(`Auspicious Abhijit Muhurta: ${chart.muhurta.abhijitMuhurta.startTime.slice(11, 16)} to ${chart.muhurta.abhijitMuhurta.endTime.slice(11, 16)}`, 60, dashaY + 95);

      // ==========================================
      // PAGE 5: TRANSITS & INTERPRETATION SUMMARY
      // ==========================================
      doc.addPage();
      doc.rect(20, 20, 555, 802).lineWidth(1).stroke('#CBD5E1');

      doc.fillColor('#C89D3C').fontSize(16).font('Helvetica-Bold').text('CURRENT PLANETARY GOCHAR (TRANSITS)', 40, 40);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('Real-time planetary alignments interacting with your natal chart', 40, 60);

      let transitY = 85;
      doc.rect(40, transitY, 515, 20).fill('#F1F5F9');
      doc.fillColor('#1E293B').fontSize(8).font('Helvetica-Bold');
      doc.text('Planet', 50, transitY + 6);
      doc.text('Transit Sign', 140, transitY + 6);
      doc.text('Transit Degree', 240, transitY + 6);
      doc.text('House from Natal Lagna', 360, transitY + 6);
      doc.text('Motion', 480, transitY + 6);

      transitY += 20;
      doc.font('Helvetica').fontSize(8);

      transits.planets.forEach((p: PlanetPosition, idx: number) => {
        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(40, transitY, 515, 18).fill('#F8FAFC');
        }
        doc.fillColor('#0F172A');
        doc.text(p.name, 50, transitY + 5);
        doc.text(p.sign, 140, transitY + 5);
        doc.text(`${p.signDegree.toFixed(2)}°`, 240, transitY + 5);
        doc.text(`House ${p.house}`, 360, transitY + 5);
        doc.text(p.retrograde ? 'Retrograde' : 'Direct', 480, transitY + 5);
        transitY += 18;
      });

      transitY += 30;
      doc.fillColor('#C89D3C').fontSize(14).font('Helvetica-Bold').text('SYNTHESIS & RECOMMENDATIONS', 40, transitY);
      transitY += 20;

      doc.rect(40, transitY, 515, 180).fillAndStroke('#F8FAFC', '#E2E8F0');
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(
        `1. Primary Karma Driver: Ascendant lord ${chart.houses[0].lord} governs the core constitution and life direction.\n\n` +
        `2. Mind & Emotional Archetype: Moon in ${moon?.sign || '—'} (${moon?.nakshatra || '—'} Nakshatra) indicates receptivity and intuitive faculties.\n\n` +
        `3. Current Progression: You are navigating the ${dasha.startingLord || 'active'} Mahadasha cycle, emphasizing alignment with long-term dharmic expansion.\n\n` +
        `4. Planetary Wisdom: Emphasize disciplined action during Saturn transits, seek intellectual expansion during Jupiter phases, and maintain grounded awareness.`,
        60,
        transitY + 20,
        { width: 475, lineGap: 4 }
      );

      // Finalize PDF Document
      doc.end();
    });
  }
}
