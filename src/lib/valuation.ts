// =============================================================================
// AeroDesk — Aircraft Valuation Engine v3
// Blue book reference values + formula fallback for all 194 models.
// =============================================================================

// ── BLUE BOOK VALUES ─────────────────────────────────────────────────────────
// Approximate fair market values (USD) for specific model+year combos.
// Source: industry reference guides, broker networks, recent transactions.
// When available, these override the formula-based calculation.

interface BlueBookEntry { year: number; value: number }

const BLUE_BOOK: Record<string, BlueBookEntry[]> = {
  // ── King Air ────────────────────────────────────────────────────────────
  "King Air 90": [
    { year: 1980, value: 450_000 }, { year: 1985, value: 550_000 },
    { year: 1990, value: 750_000 }, { year: 1995, value: 1_000_000 },
    { year: 2000, value: 1_500_000 }, { year: 2005, value: 2_200_000 },
    { year: 2006, value: 2_400_000 }, { year: 2008, value: 2_800_000 },
    { year: 2010, value: 3_200_000 }, { year: 2015, value: 3_800_000 },
    { year: 2020, value: 4_200_000 }, { year: 2024, value: 4_500_000 },
  ],
  "King Air 90GTx": [
    { year: 2008, value: 2_800_000 }, { year: 2010, value: 3_200_000 },
    { year: 2012, value: 3_500_000 }, { year: 2015, value: 3_800_000 },
    { year: 2018, value: 4_000_000 }, { year: 2020, value: 4_200_000 },
    { year: 2024, value: 4_500_000 },
  ],
  "King Air 200": [
    { year: 1985, value: 800_000 }, { year: 1990, value: 1_100_000 },
    { year: 1995, value: 1_500_000 }, { year: 2000, value: 2_200_000 },
    { year: 2005, value: 2_800_000 }, { year: 2010, value: 3_500_000 },
    { year: 2015, value: 4_200_000 }, { year: 2020, value: 5_000_000 },
  ],
  "King Air 250": [
    { year: 2010, value: 3_200_000 }, { year: 2012, value: 3_600_000 },
    { year: 2015, value: 4_200_000 }, { year: 2018, value: 4_800_000 },
    { year: 2020, value: 5_200_000 }, { year: 2022, value: 5_500_000 },
    { year: 2024, value: 5_800_000 },
  ],
  "King Air 260": [
    { year: 2020, value: 5_200_000 }, { year: 2022, value: 5_500_000 },
    { year: 2024, value: 5_700_000 }, { year: 2025, value: 5_800_000 },
  ],
  "King Air 350": [
    { year: 1995, value: 2_500_000 }, { year: 2000, value: 3_500_000 },
    { year: 2005, value: 4_500_000 }, { year: 2008, value: 5_200_000 },
    { year: 2010, value: 5_800_000 }, { year: 2012, value: 6_200_000 },
    { year: 2015, value: 6_800_000 }, { year: 2018, value: 7_200_000 },
    { year: 2020, value: 7_800_000 }, { year: 2024, value: 8_200_000 },
  ],
  "King Air 350i": [
    { year: 2010, value: 5_500_000 }, { year: 2012, value: 6_000_000 },
    { year: 2015, value: 6_800_000 }, { year: 2018, value: 7_500_000 },
    { year: 2020, value: 8_000_000 }, { year: 2024, value: 8_500_000 },
  ],
  "King Air 360": [
    { year: 2020, value: 7_500_000 }, { year: 2022, value: 7_800_000 },
    { year: 2024, value: 8_200_000 }, { year: 2025, value: 8_400_000 },
  ],
  "King Air 300": [
    { year: 1988, value: 1_200_000 }, { year: 1992, value: 1_500_000 },
    { year: 1995, value: 1_800_000 }, { year: 2000, value: 2_500_000 },
  ],

  // ── Phenom ──────────────────────────────────────────────────────────────
  "Phenom 100": [
    { year: 2008, value: 2_000_000 }, { year: 2010, value: 2_400_000 },
    { year: 2012, value: 2_800_000 }, { year: 2015, value: 3_200_000 },
  ],
  "Phenom 100E": [
    { year: 2013, value: 2_800_000 }, { year: 2015, value: 3_200_000 },
    { year: 2017, value: 3_500_000 },
  ],
  "Phenom 100EV": [
    { year: 2017, value: 3_500_000 }, { year: 2019, value: 3_800_000 },
    { year: 2021, value: 4_200_000 }, { year: 2024, value: 4_600_000 },
  ],
  "Phenom 300": [
    { year: 2009, value: 4_200_000 }, { year: 2011, value: 5_000_000 },
    { year: 2013, value: 5_800_000 }, { year: 2015, value: 6_500_000 },
    { year: 2017, value: 7_200_000 },
  ],
  "Phenom 300E": [
    { year: 2018, value: 7_500_000 }, { year: 2020, value: 8_500_000 },
    { year: 2022, value: 9_500_000 }, { year: 2024, value: 10_500_000 },
  ],
  "Praetor 500": [
    { year: 2019, value: 14_000_000 }, { year: 2020, value: 15_500_000 },
    { year: 2022, value: 17_500_000 }, { year: 2024, value: 19_500_000 },
  ],
  "Praetor 600": [
    { year: 2019, value: 15_500_000 }, { year: 2020, value: 16_500_000 },
    { year: 2022, value: 18_500_000 }, { year: 2024, value: 21_000_000 },
  ],

  // ── Legacy ──────────────────────────────────────────────────────────────
  "Legacy 450": [
    { year: 2015, value: 10_000_000 }, { year: 2017, value: 12_000_000 },
    { year: 2019, value: 14_000_000 },
  ],
  "Legacy 500": [
    { year: 2014, value: 11_000_000 }, { year: 2016, value: 13_000_000 },
    { year: 2018, value: 15_500_000 }, { year: 2020, value: 17_500_000 },
  ],
  "Legacy 600": [
    { year: 2004, value: 7_500_000 }, { year: 2007, value: 10_000_000 },
    { year: 2010, value: 13_000_000 }, { year: 2013, value: 16_000_000 },
  ],
  "Legacy 650": [
    { year: 2010, value: 14_000_000 }, { year: 2013, value: 18_000_000 },
    { year: 2015, value: 21_000_000 }, { year: 2018, value: 25_000_000 },
  ],
  "Legacy 650E": [
    { year: 2016, value: 20_000_000 }, { year: 2018, value: 24_000_000 },
    { year: 2020, value: 27_000_000 }, { year: 2023, value: 30_000_000 },
  ],

  // ── Citation ────────────────────────────────────────────────────────────
  "Citation CJ3": [
    { year: 2004, value: 3_000_000 }, { year: 2007, value: 3_800_000 },
    { year: 2010, value: 4_800_000 }, { year: 2013, value: 5_800_000 },
  ],
  "Citation CJ3+": [
    { year: 2014, value: 5_800_000 }, { year: 2016, value: 6_500_000 },
    { year: 2018, value: 7_200_000 }, { year: 2020, value: 7_800_000 },
    { year: 2024, value: 8_500_000 },
  ],
  "Citation CJ4": [
    { year: 2010, value: 4_800_000 }, { year: 2013, value: 5_800_000 },
    { year: 2015, value: 6_500_000 }, { year: 2018, value: 7_500_000 },
    { year: 2020, value: 8_200_000 }, { year: 2024, value: 9_200_000 },
  ],
  "Citation XLS": [
    { year: 2004, value: 3_500_000 }, { year: 2007, value: 4_500_000 },
    { year: 2010, value: 5_800_000 },
  ],
  "Citation XLS+": [
    { year: 2008, value: 5_500_000 }, { year: 2010, value: 6_200_000 },
    { year: 2012, value: 7_200_000 }, { year: 2015, value: 8_500_000 },
    { year: 2018, value: 10_000_000 }, { year: 2020, value: 11_500_000 },
    { year: 2024, value: 13_000_000 },
  ],
  "Citation Excel": [
    { year: 2000, value: 2_800_000 }, { year: 2003, value: 3_500_000 },
    { year: 2006, value: 4_500_000 }, { year: 2008, value: 5_500_000 },
  ],
  "Citation Latitude": [
    { year: 2015, value: 11_000_000 }, { year: 2017, value: 13_000_000 },
    { year: 2019, value: 15_000_000 }, { year: 2021, value: 17_000_000 },
    { year: 2024, value: 19_000_000 },
  ],
  "Citation Longitude": [
    { year: 2019, value: 20_000_000 }, { year: 2021, value: 23_000_000 },
    { year: 2023, value: 26_000_000 }, { year: 2025, value: 28_000_000 },
  ],
  "Citation Sovereign": [
    { year: 2005, value: 5_500_000 }, { year: 2008, value: 7_500_000 },
    { year: 2010, value: 9_000_000 }, { year: 2013, value: 11_500_000 },
  ],
  "Citation Sovereign+": [
    { year: 2013, value: 11_000_000 }, { year: 2015, value: 13_000_000 },
    { year: 2018, value: 15_500_000 }, { year: 2020, value: 17_000_000 },
  ],
  "Citation Mustang": [
    { year: 2007, value: 1_600_000 }, { year: 2010, value: 2_000_000 },
    { year: 2013, value: 2_400_000 }, { year: 2016, value: 2_800_000 },
  ],
  "Citation M2": [
    { year: 2013, value: 2_800_000 }, { year: 2015, value: 3_200_000 },
    { year: 2018, value: 3_800_000 }, { year: 2020, value: 4_200_000 },
  ],
  "Citation Bravo": [
    { year: 1997, value: 1_800_000 }, { year: 2000, value: 2_200_000 },
    { year: 2003, value: 2_800_000 }, { year: 2006, value: 3_500_000 },
  ],

  // ── Hawker ──────────────────────────────────────────────────────────────
  "Hawker 800XP": [
    { year: 1998, value: 2_500_000 }, { year: 2001, value: 3_200_000 },
    { year: 2004, value: 4_200_000 }, { year: 2006, value: 5_000_000 },
    { year: 2008, value: 5_500_000 },
  ],
  "Hawker 850XP": [
    { year: 2006, value: 4_500_000 }, { year: 2008, value: 5_500_000 },
    { year: 2010, value: 6_500_000 },
  ],
  "Hawker 900XP": [
    { year: 2007, value: 5_000_000 }, { year: 2009, value: 6_000_000 },
    { year: 2011, value: 7_000_000 }, { year: 2013, value: 8_500_000 },
  ],
  "Hawker 400XP": [
    { year: 2003, value: 2_000_000 }, { year: 2006, value: 2_500_000 },
    { year: 2009, value: 3_200_000 },
  ],

  // ── Challenger / Global ─────────────────────────────────────────────────
  "Challenger 300": [
    { year: 2004, value: 7_000_000 }, { year: 2007, value: 9_500_000 },
    { year: 2010, value: 12_000_000 }, { year: 2013, value: 14_500_000 },
  ],
  "Challenger 350": [
    { year: 2014, value: 14_000_000 }, { year: 2016, value: 16_000_000 },
    { year: 2018, value: 18_500_000 }, { year: 2020, value: 21_000_000 },
    { year: 2022, value: 24_000_000 }, { year: 2024, value: 27_000_000 },
  ],
  "Challenger 604": [
    { year: 1996, value: 5_500_000 }, { year: 2000, value: 7_500_000 },
    { year: 2004, value: 10_000_000 }, { year: 2007, value: 12_000_000 },
  ],
  "Challenger 605": [
    { year: 2008, value: 11_000_000 }, { year: 2010, value: 13_000_000 },
    { year: 2012, value: 15_000_000 }, { year: 2014, value: 17_500_000 },
  ],
  "Challenger 650": [
    { year: 2015, value: 17_000_000 }, { year: 2018, value: 22_000_000 },
    { year: 2020, value: 25_000_000 }, { year: 2023, value: 30_000_000 },
  ],
  "Global 6500": [
    { year: 2019, value: 42_000_000 }, { year: 2021, value: 47_000_000 },
    { year: 2023, value: 52_000_000 }, { year: 2025, value: 54_000_000 },
  ],

  // ── Gulfstream ──────────────────────────────────────────────────────────
  "G280": [
    { year: 2012, value: 14_000_000 }, { year: 2015, value: 17_000_000 },
    { year: 2018, value: 20_000_000 }, { year: 2021, value: 23_000_000 },
    { year: 2024, value: 25_000_000 },
  ],
  "G550": [
    { year: 2005, value: 16_000_000 }, { year: 2008, value: 22_000_000 },
    { year: 2010, value: 28_000_000 }, { year: 2013, value: 34_000_000 },
    { year: 2015, value: 38_000_000 }, { year: 2018, value: 46_000_000 },
  ],
  "G650": [
    { year: 2012, value: 35_000_000 }, { year: 2015, value: 42_000_000 },
    { year: 2018, value: 50_000_000 }, { year: 2020, value: 55_000_000 },
    { year: 2023, value: 60_000_000 },
  ],
  "G650ER": [
    { year: 2014, value: 38_000_000 }, { year: 2017, value: 48_000_000 },
    { year: 2020, value: 56_000_000 }, { year: 2023, value: 63_000_000 },
  ],

  // ── Dassault ────────────────────────────────────────────────────────────
  "Falcon 900LX": [
    { year: 2010, value: 14_000_000 }, { year: 2013, value: 18_000_000 },
    { year: 2016, value: 22_000_000 }, { year: 2019, value: 27_000_000 },
  ],
  "Falcon 2000LXS": [
    { year: 2014, value: 17_000_000 }, { year: 2017, value: 22_000_000 },
    { year: 2020, value: 26_000_000 }, { year: 2023, value: 30_000_000 },
  ],
  "Falcon 7X": [
    { year: 2007, value: 18_000_000 }, { year: 2010, value: 24_000_000 },
    { year: 2013, value: 30_000_000 }, { year: 2016, value: 36_000_000 },
    { year: 2019, value: 42_000_000 },
  ],
  "Falcon 8X": [
    { year: 2016, value: 38_000_000 }, { year: 2019, value: 45_000_000 },
    { year: 2022, value: 52_000_000 }, { year: 2024, value: 56_000_000 },
  ],

  // ── Grand Caravan ───────────────────────────────────────────────────────
  "Grand Caravan": [
    { year: 2000, value: 850_000 }, { year: 2005, value: 1_100_000 },
    { year: 2010, value: 1_500_000 }, { year: 2015, value: 1_800_000 },
    { year: 2020, value: 2_100_000 },
  ],
  "Grand Caravan EX": [
    { year: 2013, value: 1_500_000 }, { year: 2016, value: 1_800_000 },
    { year: 2019, value: 2_100_000 }, { year: 2022, value: 2_400_000 },
    { year: 2024, value: 2_600_000 },
  ],
  "Caravan": [
    { year: 1990, value: 550_000 }, { year: 1995, value: 700_000 },
    { year: 2000, value: 900_000 }, { year: 2005, value: 1_100_000 },
    { year: 2010, value: 1_400_000 }, { year: 2015, value: 1_700_000 },
    { year: 2020, value: 2_000_000 },
  ],

  // ── TBM ─────────────────────────────────────────────────────────────────
  "TBM 900": [
    { year: 2014, value: 2_700_000 }, { year: 2016, value: 3_100_000 },
    { year: 2018, value: 3_500_000 },
  ],
  "TBM 910": [
    { year: 2017, value: 3_200_000 }, { year: 2019, value: 3_600_000 },
    { year: 2021, value: 4_000_000 },
  ],
  "TBM 930": [
    { year: 2016, value: 3_200_000 }, { year: 2018, value: 3_600_000 },
    { year: 2020, value: 4_000_000 },
  ],
  "TBM 940": [
    { year: 2019, value: 3_800_000 }, { year: 2021, value: 4_200_000 },
    { year: 2023, value: 4_600_000 },
  ],
  "TBM 960": [
    { year: 2022, value: 4_600_000 }, { year: 2024, value: 5_000_000 },
    { year: 2025, value: 5_200_000 },
  ],
  "TBM 850": [
    { year: 2006, value: 1_800_000 }, { year: 2009, value: 2_200_000 },
    { year: 2012, value: 2_600_000 }, { year: 2014, value: 3_000_000 },
  ],
  "TBM 700": [
    { year: 1994, value: 800_000 }, { year: 1998, value: 1_000_000 },
    { year: 2002, value: 1_300_000 }, { year: 2005, value: 1_600_000 },
  ],

  // ── Pilatus ─────────────────────────────────────────────────────────────
  "PC-12": [
    { year: 1996, value: 1_500_000 }, { year: 2000, value: 2_000_000 },
    { year: 2005, value: 2_800_000 }, { year: 2008, value: 3_500_000 },
  ],
  "PC-12 NG": [
    { year: 2008, value: 3_200_000 }, { year: 2011, value: 3_800_000 },
    { year: 2014, value: 4_200_000 }, { year: 2017, value: 4_800_000 },
    { year: 2019, value: 5_200_000 },
  ],
  "PC-12 NGX": [
    { year: 2020, value: 5_000_000 }, { year: 2022, value: 5_300_000 },
    { year: 2024, value: 5_600_000 },
  ],
  "PC-24": [
    { year: 2018, value: 7_500_000 }, { year: 2020, value: 8_500_000 },
    { year: 2022, value: 9_500_000 }, { year: 2024, value: 11_000_000 },
  ],

  // ── Helicopters (Brazil-popular) ────────────────────────────────────────
  "H125": [
    { year: 2005, value: 1_200_000 }, { year: 2010, value: 1_800_000 },
    { year: 2015, value: 2_300_000 }, { year: 2018, value: 2_600_000 },
    { year: 2020, value: 2_800_000 }, { year: 2024, value: 3_100_000 },
  ],
  "H125 (AS350)": [
    { year: 2000, value: 900_000 }, { year: 2005, value: 1_200_000 },
    { year: 2010, value: 1_800_000 }, { year: 2015, value: 2_300_000 },
  ],
  "H130 (EC130)": [
    { year: 2005, value: 1_300_000 }, { year: 2010, value: 1_800_000 },
    { year: 2015, value: 2_400_000 }, { year: 2020, value: 2_900_000 },
  ],
  "H135 (EC135)": [
    { year: 2005, value: 2_000_000 }, { year: 2010, value: 2_800_000 },
    { year: 2015, value: 3_800_000 }, { year: 2020, value: 4_800_000 },
  ],
  "H145": [
    { year: 2015, value: 4_800_000 }, { year: 2018, value: 5_800_000 },
    { year: 2020, value: 6_200_000 }, { year: 2023, value: 7_000_000 },
  ],
  "Bell 407": [
    { year: 2000, value: 1_200_000 }, { year: 2005, value: 1_600_000 },
    { year: 2010, value: 2_200_000 }, { year: 2015, value: 2_700_000 },
  ],
  "407GXi": [
    { year: 2018, value: 2_800_000 }, { year: 2020, value: 3_100_000 },
    { year: 2022, value: 3_300_000 }, { year: 2024, value: 3_600_000 },
  ],
  "Bell 407GXi": [
    { year: 2018, value: 2_800_000 }, { year: 2020, value: 3_100_000 },
    { year: 2022, value: 3_300_000 }, { year: 2024, value: 3_600_000 },
  ],
  "429": [
    { year: 2010, value: 4_500_000 }, { year: 2013, value: 5_500_000 },
    { year: 2016, value: 6_500_000 }, { year: 2019, value: 7_200_000 },
    { year: 2022, value: 7_800_000 },
  ],
  "Bell 429": [
    { year: 2010, value: 4_500_000 }, { year: 2013, value: 5_500_000 },
    { year: 2016, value: 6_500_000 }, { year: 2019, value: 7_200_000 },
    { year: 2022, value: 7_800_000 },
  ],
  "R44 Raven II": [
    { year: 2005, value: 150_000 }, { year: 2010, value: 220_000 },
    { year: 2015, value: 280_000 }, { year: 2018, value: 320_000 },
    { year: 2022, value: 360_000 }, { year: 2024, value: 380_000 },
  ],
  "R66 Turbine": [
    { year: 2012, value: 450_000 }, { year: 2015, value: 550_000 },
    { year: 2018, value: 650_000 }, { year: 2021, value: 740_000 },
    { year: 2024, value: 820_000 },
  ],
  "AW109": [
    { year: 2000, value: 1_500_000 }, { year: 2005, value: 2_000_000 },
    { year: 2010, value: 2_800_000 }, { year: 2015, value: 3_500_000 },
  ],
  "AW139": [
    { year: 2008, value: 5_000_000 }, { year: 2012, value: 6_500_000 },
    { year: 2015, value: 7_500_000 }, { year: 2018, value: 8_500_000 },
    { year: 2022, value: 10_000_000 },
  ],

  // ── Piston (Brazil-popular) ─────────────────────────────────────────────
  "SR22T": [
    { year: 2010, value: 380_000 }, { year: 2013, value: 450_000 },
    { year: 2015, value: 520_000 }, { year: 2018, value: 620_000 },
    { year: 2020, value: 720_000 }, { year: 2023, value: 850_000 },
  ],
  "SR22": [
    { year: 2005, value: 250_000 }, { year: 2008, value: 320_000 },
    { year: 2010, value: 380_000 }, { year: 2013, value: 450_000 },
    { year: 2016, value: 520_000 }, { year: 2020, value: 650_000 },
  ],
  "Baron 58": [
    { year: 1985, value: 150_000 }, { year: 1990, value: 180_000 },
    { year: 1995, value: 220_000 }, { year: 2000, value: 280_000 },
    { year: 2005, value: 340_000 }, { year: 2010, value: 400_000 },
  ],
  "Bonanza G36": [
    { year: 2006, value: 380_000 }, { year: 2010, value: 450_000 },
    { year: 2015, value: 550_000 }, { year: 2020, value: 700_000 },
    { year: 2024, value: 820_000 },
  ],
  "Seneca V": [
    { year: 2000, value: 280_000 }, { year: 2005, value: 350_000 },
    { year: 2010, value: 450_000 }, { year: 2015, value: 550_000 },
    { year: 2020, value: 680_000 },
  ],

  // ── Piper turboprops ────────────────────────────────────────────────────
  "M600/SLS": [
    { year: 2020, value: 2_400_000 }, { year: 2022, value: 2_800_000 },
    { year: 2024, value: 3_200_000 },
  ],
  "Meridian": [
    { year: 2003, value: 900_000 }, { year: 2006, value: 1_200_000 },
    { year: 2009, value: 1_500_000 }, { year: 2012, value: 1_900_000 },
  ],

  // ── Cirrus Jet ──────────────────────────────────────────────────────────
  "SF50 Vision Jet": [
    { year: 2017, value: 1_600_000 }, { year: 2019, value: 1_900_000 },
  ],
  "SF50 G2": [
    { year: 2020, value: 2_200_000 }, { year: 2022, value: 2_500_000 },
    { year: 2024, value: 2_800_000 },
  ],
  "SF50 G2+": [
    { year: 2023, value: 2_700_000 }, { year: 2025, value: 3_000_000 },
  ],
};

/**
 * Lookup blue book value for a model+year using linear interpolation.
 * Returns null if no data exists for this model.
 */
function lookupBlueBook(modelName: string, year: number): number | null {
  const entries = BLUE_BOOK[modelName];
  if (!entries || entries.length === 0) return null;

  // Exact match
  const exact = entries.find((e) => e.year === year);
  if (exact) return exact.value;

  // Sort by year
  const sorted = [...entries].sort((a, b) => a.year - b.year);

  // Before first data point: extrapolate backward with 5%/yr depreciation
  if (year < sorted[0].year) {
    const diff = sorted[0].year - year;
    return Math.round(sorted[0].value * Math.pow(0.95, diff));
  }

  // After last data point: extrapolate forward with 3%/yr depreciation
  if (year > sorted[sorted.length - 1].year) {
    const diff = year - sorted[sorted.length - 1].year;
    return Math.round(sorted[sorted.length - 1].value * Math.pow(0.97, diff));
  }

  // Interpolate between two data points
  for (let i = 0; i < sorted.length - 1; i++) {
    if (year >= sorted[i].year && year <= sorted[i + 1].year) {
      const t = (year - sorted[i].year) / (sorted[i + 1].year - sorted[i].year);
      return Math.round(sorted[i].value + t * (sorted[i + 1].value - sorted[i].value));
    }
  }

  return null;
}

// ── FORMULA FALLBACK ─────────────────────────────────────────────────────────

/** New-delivery list prices for formula fallback. */
const MODEL_BASE_PRICES: Record<string, number> = {
  "H120 (EC120)": 1_600_000, "H125": 3_100_000, "H125 (AS350)": 3_100_000,
  "H130 (EC130)": 3_300_000, "H135 (EC135)": 5_500_000, "H145": 7_200_000,
  "H145 (EC145)": 7_200_000, "H155 (EC155)": 10_000_000, "H160": 19_000_000,
  "H175": 14_000_000, "H215 (AS332)": 16_000_000, "H225 (EC225)": 24_000_000,
  "Baron 58": 480_000, "Baron G58": 620_000, "Bonanza A36": 520_000,
  "Bonanza G36": 820_000, "Hawker 4000": 22_500_000, "Hawker 400XP": 7_000_000,
  "Hawker 750": 13_000_000, "Hawker 800XP": 14_000_000, "Hawker 850XP": 15_500_000,
  "Hawker 900XP": 16_500_000, "King Air 200": 5_500_000, "King Air 250": 5_800_000,
  "King Air 260": 5_700_000, "King Air 300": 4_200_000, "King Air 350": 8_200_000,
  "King Air 350i": 8_500_000, "King Air 360": 8_400_000, "King Air 360ER": 8_700_000,
  "King Air 90": 4_500_000, "King Air 90GTx": 4_500_000, "Premier I": 6_800_000,
  "Premier IA": 7_200_000, "407GXi": 3_600_000, "429": 8_200_000,
  "Bell 206B": 850_000, "Bell 206L": 1_200_000, "Bell 407": 3_200_000,
  "Bell 407GXi": 3_600_000, "Bell 412": 7_500_000, "Bell 429": 8_200_000,
  "Bell 505": 2_100_000, "Bell 525": 17_000_000, "Challenger 300": 22_000_000,
  "Challenger 350": 27_000_000, "Challenger 604": 28_000_000,
  "Challenger 605": 30_000_000, "Challenger 650": 32_000_000,
  "Global 5000": 40_000_000, "Global 5500": 46_000_000, "Global 6000": 52_000_000,
  "Global 6500": 54_000_000, "Global 7500": 72_000_000, "Global 8000": 78_000_000,
  "Global Express": 45_000_000, "Global Express XRS": 48_000_000,
  "Learjet 40": 10_500_000, "Learjet 45": 11_000_000, "Learjet 45XR": 12_500_000,
  "Learjet 60": 13_000_000, "Learjet 60XR": 14_500_000, "Learjet 70": 12_500_000,
  "Learjet 75": 13_800_000, "172 Skyhawk": 360_000, "182 Skylane": 500_000,
  "206 Stationair": 450_000, "210 Centurion": 380_000, "Caravan": 2_100_000,
  "Citation Bravo": 8_500_000, "Citation CJ1": 5_200_000, "Citation CJ1+": 5_500_000,
  "Citation CJ2": 6_800_000, "Citation CJ2+": 7_200_000, "Citation CJ3": 7_800_000,
  "Citation CJ3+": 8_500_000, "Citation CJ4": 9_200_000, "Citation Encore": 8_000_000,
  "Citation Encore+": 8_500_000, "Citation Excel": 10_500_000,
  "Citation Latitude": 19_000_000, "Citation Longitude": 28_000_000,
  "Citation M2": 4_700_000, "Citation M2 Gen2": 5_000_000,
  "Citation Mustang": 3_300_000, "Citation Sovereign": 17_000_000,
  "Citation Sovereign+": 18_500_000, "Citation Ultra": 7_000_000,
  "Citation V": 6_500_000, "Citation X": 21_000_000, "Citation X+": 23_000_000,
  "Citation XLS": 11_000_000, "Citation XLS+": 13_000_000,
  "Conquest I": 1_800_000, "Conquest II": 2_200_000, "Denali": 5_500_000,
  "Grand Caravan": 2_300_000, "Grand Caravan EX": 2_600_000,
  "T206H Turbo Stationair": 550_000, "TTx (T240)": 750_000,
  "SF50 G2": 2_800_000, "SF50 G2+": 3_000_000, "SF50 Vision Jet": 2_400_000,
  "SR20": 700_000, "SR22": 780_000, "SR22T": 920_000, "SR22T G6": 920_000,
  "SR22T G7": 980_000, "Kodiak 100": 2_800_000, "Kodiak 900": 3_500_000,
  "TBM 700": 2_200_000, "TBM 850": 3_300_000, "TBM 900": 3_900_000,
  "TBM 910": 4_200_000, "TBM 930": 4_500_000, "TBM 940": 4_700_000,
  "TBM 960": 5_200_000, "Falcon 10X": 75_000_000, "Falcon 2000": 22_000_000,
  "Falcon 2000EX": 27_000_000, "Falcon 2000LX": 30_000_000,
  "Falcon 2000LXS": 31_000_000, "Falcon 2000S": 28_000_000,
  "Falcon 50": 15_000_000, "Falcon 50EX": 17_000_000, "Falcon 6X": 55_000_000,
  "Falcon 7X": 50_000_000, "Falcon 8X": 58_000_000, "Falcon 900": 20_000_000,
  "Falcon 900DX": 24_000_000, "Falcon 900EX": 28_000_000,
  "Falcon 900LX": 32_000_000, "EMB 120 Brasilia": 5_500_000,
  "Legacy 450": 16_000_000, "Legacy 500": 20_000_000, "Legacy 600": 25_000_000,
  "Legacy 650": 30_000_000, "Legacy 650E": 32_000_000,
  "Lineage 1000": 50_000_000, "Lineage 1000E": 53_000_000,
  "Phenom 100": 4_200_000, "Phenom 100E": 4_400_000, "Phenom 100EV": 4_600_000,
  "Phenom 300": 9_000_000, "Phenom 300E": 10_500_000,
  "Praetor 500": 20_200_000, "Praetor 600": 21_500_000,
  "G150": 14_500_000, "G200": 18_000_000, "G280": 25_000_000,
  "G400": 34_500_000, "G450": 38_000_000, "G500": 44_000_000,
  "G550": 56_000_000, "G600": 58_000_000, "G650": 62_000_000,
  "G650ER": 66_000_000, "G700": 75_000_000, "G800": 72_000_000,
  "GIV-SP": 32_000_000, "GV": 42_000_000, "AW109": 4_200_000,
  "AW109S": 5_000_000, "AW119": 3_600_000, "AW139": 10_500_000,
  "AW169": 7_000_000, "AW189": 16_000_000, "PC-12": 4_500_000,
  "PC-12 NG": 5_200_000, "PC-12 NGX": 5_600_000, "PC-24": 11_000_000,
  "Archer III": 390_000, "Archer LX": 440_000, "Archer TX": 520_000,
  "Cheyenne": 2_200_000, "M350": 650_000, "M500": 2_800_000,
  "M600": 3_000_000, "M600/SLS": 3_200_000, "M700 Fury": 3_800_000,
  "Malibu": 550_000, "Malibu Mirage": 680_000, "Meridian": 2_400_000,
  "Seneca V": 760_000, "Warrior III": 340_000, "R22": 280_000,
  "R22 Beta II": 320_000, "R44 Cadet": 350_000, "R44 Raven I": 360_000,
  "R44 Raven II": 380_000, "R66 Turbine": 820_000, "S-76C++": 10_000_000,
  "S-76D": 14_000_000, "S-92": 25_000_000,
};

const CATEGORY_MIDPOINT: Record<string, number> = {
  jet: 18_000_000, turboprop: 4_000_000, piston: 500_000, helicopter: 2_500_000,
};

function getDepreciationRate(cat: string, age: number): number {
  if (cat === "jet") { return age <= 5 ? 0.07 : age <= 15 ? 0.05 : 0.035; }
  if (cat === "turboprop") { return age <= 5 ? 0.065 : age <= 15 ? 0.05 : 0.035; }
  if (cat === "piston") { return age <= 5 ? 0.06 : age <= 15 ? 0.035 : 0.02; }
  return age <= 5 ? 0.07 : age <= 15 ? 0.055 : 0.04; // helicopter
}

const EXPECTED_HOURS_PER_YEAR: Record<string, number> = {
  jet: 200, turboprop: 250, piston: 300, helicopter: 180,
};

const CURRENT_YEAR = 2026;

export interface ValuationInput {
  model_name: string;
  category: string;
  year: number;
  total_time_hours?: number | null;
  engine_time_smoh?: number | null;
  condition_rating?: number | null;
  engine_program?: string | null;
}

export interface ValuationResult {
  low: number;
  mid: number;
  high: number;
  trend: "appreciating" | "stable" | "depreciating";
  confidence: "high" | "medium" | "low";
  source: "blue_book" | "formula";
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  const { model_name, category, year, total_time_hours, condition_rating, engine_program } = input;
  const cat = (category ?? "jet").toLowerCase();
  const age = Math.max(CURRENT_YEAR - year, 0);

  // ── 1. Try Blue Book lookup first ──────────────────────────────────────────
  const blueBookBase = lookupBlueBook(model_name, year);
  const hasBlueBook = blueBookBase !== null;
  const hasModelData = model_name in MODEL_BASE_PRICES;

  let mid: number;
  let source: "blue_book" | "formula";

  if (hasBlueBook) {
    // Blue book gives us a market value already adjusted for year
    mid = blueBookBase;
    source = "blue_book";
  } else {
    // Formula fallback: base price × depreciation
    const basePrice = MODEL_BASE_PRICES[model_name] ?? CATEGORY_MIDPOINT[cat] ?? 10_000_000;
    let deprecFactor = 1.0;
    for (let y = 0; y < age; y++) {
      deprecFactor *= 1 - getDepreciationRate(cat, y);
    }
    deprecFactor = Math.max(deprecFactor, 0.15);
    mid = basePrice * deprecFactor;
    source = "formula";
  }

  // ── 2. Hours adjustment (applies to both sources) ──────────────────────────
  if (total_time_hours != null && total_time_hours > 0 && age > 0) {
    const expectedHours = (EXPECTED_HOURS_PER_YEAR[cat] ?? 200) * age;
    const ratio = total_time_hours / expectedHours;
    if (ratio > 1.15) {
      mid *= 1 - Math.min((ratio - 1) * 0.35, 0.18);
    } else if (ratio < 0.65) {
      mid *= 1 + Math.min((1 - ratio) * 0.12, 0.07);
    }
  }

  // ── 3. Condition adjustment ────────────────────────────────────────────────
  const condAdj: Record<number, number> = {
    1: -0.50, 2: -0.35, 3: -0.20, 4: -0.10,
    5: -0.03, 6: 0,     7: 0.04,  8: 0.08,
    9: 0.13,  10: 0.20,
  };
  if (condition_rating != null) {
    mid *= 1 + (condAdj[condition_rating] ?? 0);
  }

  // ── 4. Engine program ──────────────────────────────────────────────────────
  if (engine_program === "enrolled") {
    mid *= 1.10;
  } else if (engine_program === "not_enrolled") {
    mid *= 0.94;
  }

  // ── 5. Spread for Low / High ───────────────────────────────────────────────
  let spread: number;
  if (hasBlueBook) spread = 0.08; // Tighter when we have blue book data
  else if (cat === "piston") spread = 0.10;
  else if (cat === "helicopter") spread = 0.14;
  else spread = 0.12;
  if (age > 20) spread += 0.03;
  if (hasModelData && !hasBlueBook) spread -= 0.02;

  const low = mid * (1 - spread);
  const high = mid * (1 + spread);

  // ── 6. Trend ───────────────────────────────────────────────────────────────
  let trend: "appreciating" | "stable" | "depreciating";
  if (age <= 5) trend = "depreciating";
  else if (age <= 12) trend = "depreciating";
  else trend = "stable";

  // ── 7. Confidence ─────────────────────────────────────────────────────────
  let confidence: "high" | "medium" | "low";
  if (hasBlueBook) confidence = "high";
  else if (hasModelData) confidence = "medium";
  else confidence = "low";

  return {
    low: Math.round(low),
    mid: Math.round(mid),
    high: Math.round(high),
    trend,
    confidence,
    source,
  };
}

/** Compact price formatter for valuation displays (no cents). */
export function fmtVal(n: number, locale: string = "en"): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  const jsLocale = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  return `$${n.toLocaleString(jsLocale)}`;
}

/** Where does `price` fall on the [low, high] bar? Returns 0-100. */
export function pricePosition(price: number, low: number, high: number): number {
  if (high <= low) return 50;
  return Math.round(Math.min(Math.max(((price - low) / (high - low)) * 100, 0), 100));
}

/** Price badge relative to the valuation mid. */
export function priceBadge(price: number, mid: number): {
  label: string;
  cls: string;
} {
  const ratio = price / mid;
  if (ratio < 0.93) return { label: "Below Market", cls: "bg-green-100 text-green-700" };
  if (ratio > 1.07) return { label: "Above Market", cls: "bg-orange-100 text-orange-700" };
  return { label: "Market Price", cls: "bg-blue-100 text-[#2563EB]" };
}
