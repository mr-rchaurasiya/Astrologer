# PDF Horoscope Report Generation Engine

## Overview
The PDF Horoscope Report Engine compiles comprehensive, print-ready astrological dossiers in vector format using `pdfkit`. The engine executes deterministic astronomical algorithms server-side, draws high-resolution charts, and stores the rendered files via pluggable storage (`LocalStorageProvider` or `S3StorageProvider`).

## Report Structure

### Page 1: Native Dossier & Astrological Identifiers
- Complete birth data: Date, Time, Coordinates (Latitude, Longitude), Timezone offset, Place name.
- Core Jyotish anchors: Ascendant sign and degree, Moon Rashi, Janma Nakshatra, Pada, and calculated Lahiri Ayanamsa value.
- Non-medical / non-deterministic Vedic philosophical disclaimer.

### Page 2: Planetary Placements & 12 Bhavas
- Ephemeris positions: Sidereal Nirayana degrees, sign lords, Nakshatras, Padas, dignities (exalted, own, debilitated, etc.), and retrograde status.
- Whole Sign Bhava table: 12 Houses with start degrees, house lords, and planetary occupants.

### Page 3: North Indian Kundli Vector Diagrams
- Vector geometry rendering: Outer rectangular frame, central Lagna diamond, and angular houses.
- D1 Rashi Chart (Physical manifest karma).
- D9 Navamsha Chart (Dharmic fruits, subconscious tendencies, and relationships).

### Page 4: 120-Year Vimshottari Dasha & Sacred Panchang
- Vimshottari Mahadasha timeline with start dates, end dates, and span in years.
- Panchang five limbs: Tithi (Lunar day & Paksha), Vara (Day ruler), Nakshatra, Yoga, Karana.
- Daily Abhijit Muhurta auspicious window.

### Page 5: Real-time Planetary Transits (Gochar) & Synthesis
- Real-time planetary positions calculated for current timestamp.
- House position reckoned from native's natal Lagna.
- Astrological synthesis outlining karma drivers, emotional constitution, and planetary recommendations.

## Storage and Security
- Reports are stored in `server/storage/reports/` (configurable via `STORAGE_TYPE` and `STORAGE_PATH`).
- Secure downloads are streamed via `GET /api/v1/reports/:id/download` with `Content-Disposition: attachment; filename="..."`.
- Strict user ownership verification ensures User B can never download or query User A's generated reports.
