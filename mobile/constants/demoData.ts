export interface DemoListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  location_city: string;
  location_state: string;
  location_country: string;
  year: number;
  total_time_hours: number;
  engine_time_smoh: number | null;
  images: string[];
  category: string;
  manufacturer: string;
  model: string;
  description: string;
  featured: boolean;
  range_nm: number;
  max_speed_kts: number;
  seats: number;
  seller_name: string;
  seller_whatsapp: string;
}

// ONLY 4 photos confirmed working from user screenshots - rotated across listings
const IMG = {
  a: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=500&fit=crop&q=80",  // jet on tarmac
  b: "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&h=500&fit=crop&q=80",  // jet runway dusk
  c: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=500&fit=crop&q=80",  // jet sunset
  d: "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800&h=500&fit=crop&q=80",  // airport planes
};

export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: "demo-1", title: "2019 Cessna Citation CJ4", price: 8950000, currency: "USD",
    location_city: "São Paulo", location_state: "SP", location_country: "Brazil",
    year: 2019, total_time_hours: 1240, engine_time_smoh: null,
    images: [IMG.a, IMG.b],
    category: "jet", manufacturer: "Cessna", model: "Citation CJ4",
    description: "Impeccable 2019 Cessna Citation CJ4 with low hours. Full Garmin G3000 avionics suite, WiFi, and premium interior. All inspections current. One owner, hangared since new.",
    featured: true, range_nm: 2165, max_speed_kts: 451, seats: 9,
    seller_name: "AeroDesk Aviation", seller_whatsapp: "+5511999999999",
  },
  {
    id: "demo-2", title: "2020 Embraer Phenom 300E", price: 9750000, currency: "USD",
    location_city: "Miami", location_state: "FL", location_country: "USA",
    year: 2020, total_time_hours: 980, engine_time_smoh: null,
    images: [IMG.c, IMG.a],
    category: "jet", manufacturer: "Embraer", model: "Phenom 300E",
    description: "Best-selling light jet in its class. Prodigy Touch avionics, Bose audio, and a fully refreshed interior. Enrolled on RRCC.",
    featured: true, range_nm: 1971, max_speed_kts: 453, seats: 9,
    seller_name: "Atlantic Jets", seller_whatsapp: "+1305555555",
  },
  {
    id: "demo-3", title: "2018 Beechcraft King Air 350i", price: 4200000, currency: "USD",
    location_city: "Buenos Aires", location_state: "BA", location_country: "Argentina",
    year: 2018, total_time_hours: 2100, engine_time_smoh: 1200,
    images: [IMG.b, IMG.d],
    category: "turboprop", manufacturer: "Beechcraft", model: "King Air 350i",
    description: "Versatile twin turboprop in excellent condition. Pro Line Fusion avionics, dual FMS, TCAS II. Ideal for regional operations.",
    featured: true, range_nm: 1806, max_speed_kts: 312, seats: 11,
    seller_name: "Patagonia Aviation", seller_whatsapp: "+5411555555",
  },
  {
    id: "demo-4", title: "2021 Cirrus SR22T", price: 895000, currency: "USD",
    location_city: "Campinas", location_state: "SP", location_country: "Brazil",
    year: 2021, total_time_hours: 420, engine_time_smoh: 420,
    images: [IMG.d, IMG.a],
    category: "single_engine_piston", manufacturer: "Cirrus", model: "SR22T",
    description: "Low-time 2021 Cirrus SR22T with Perspective+ by Garmin. CAPS parachute system, A/C, and premium leather interior.",
    featured: true, range_nm: 1021, max_speed_kts: 183, seats: 4,
    seller_name: "Cirrus Brasil", seller_whatsapp: "+5519999999999",
  },
  {
    id: "demo-5", title: "2017 Bombardier Challenger 350", price: 18500000, currency: "USD",
    location_city: "Bogotá", location_state: "DC", location_country: "Colombia",
    year: 2017, total_time_hours: 2800, engine_time_smoh: null,
    images: [IMG.c, IMG.b],
    category: "jet", manufacturer: "Bombardier", model: "Challenger 350",
    description: "Super midsize jet with intercontinental range. Bombardier Vision flight deck, full galley. APU enrolled.",
    featured: true, range_nm: 3200, max_speed_kts: 459, seats: 10,
    seller_name: "LatAm Executive Jets", seller_whatsapp: "+571555555555",
  },
  {
    id: "demo-6", title: "2022 Piper M600/SLS", price: 3100000, currency: "USD",
    location_city: "Santiago", location_state: "RM", location_country: "Chile",
    year: 2022, total_time_hours: 310, engine_time_smoh: 310,
    images: [IMG.d, IMG.c],
    category: "turboprop", manufacturer: "Piper", model: "M600/SLS",
    description: "Single-engine turboprop with HALO Safety System and Garmin G3000 NXi. Perfect for owner-pilots.",
    featured: true, range_nm: 1484, max_speed_kts: 274, seats: 6,
    seller_name: "Andes Aviation", seller_whatsapp: "+569555555555",
  },
  {
    id: "demo-7", title: "2016 Robinson R66 Turbine", price: 950000, currency: "USD",
    location_city: "Rio de Janeiro", location_state: "RJ", location_country: "Brazil",
    year: 2016, total_time_hours: 1800, engine_time_smoh: 800,
    images: [IMG.a, IMG.c],
    category: "helicopter", manufacturer: "Robinson", model: "R66 Turbine",
    description: "Well-maintained Robinson R66 Turbine. Rolls-Royce RR300 engine. A/C, leather seats, cargo hook.",
    featured: false, range_nm: 325, max_speed_kts: 110, seats: 4,
    seller_name: "Heli Rio", seller_whatsapp: "+5521999999999",
  },
  {
    id: "demo-8", title: "2015 Pilatus PC-12 NG", price: 4500000, currency: "USD",
    location_city: "Brasília", location_state: "DF", location_country: "Brazil",
    year: 2015, total_time_hours: 2400, engine_time_smoh: 1100,
    images: [IMG.b, IMG.a],
    category: "turboprop", manufacturer: "Pilatus", model: "PC-12 NG",
    description: "Swiss-made single turboprop. Honeywell Primus Apex avionics. Executive interior for 8 passengers. Cargo door.",
    featured: false, range_nm: 1560, max_speed_kts: 280, seats: 8,
    seller_name: "Executive Turboprops", seller_whatsapp: "+5561999999999",
  },
  {
    id: "demo-9", title: "2020 Diamond DA62", price: 1250000, currency: "USD",
    location_city: "Curitiba", location_state: "PR", location_country: "Brazil",
    year: 2020, total_time_hours: 650, engine_time_smoh: 650,
    images: [IMG.c, IMG.d],
    category: "multi_engine_piston", manufacturer: "Diamond", model: "DA62",
    description: "Modern twin-engine piston with jet-fuel efficiency. Garmin G1000 NXi, GFC 700 autopilot. Carbon fiber airframe.",
    featured: false, range_nm: 1100, max_speed_kts: 192, seats: 7,
    seller_name: "Diamond Brasil", seller_whatsapp: "+5541999999999",
  },
  {
    id: "demo-10", title: "2019 Gulfstream G280", price: 16800000, currency: "USD",
    location_city: "São Paulo", location_state: "SP", location_country: "Brazil",
    year: 2019, total_time_hours: 1650, engine_time_smoh: null,
    images: [IMG.a, IMG.c],
    category: "jet", manufacturer: "Gulfstream", model: "G280",
    description: "Super midsize Gulfstream. PlaneView280 cockpit, low cabin altitude, Honeywell HTF7250G engines. Corporate operated.",
    featured: false, range_nm: 3600, max_speed_kts: 482, seats: 10,
    seller_name: "AeroDesk Aviation", seller_whatsapp: "+5511999999999",
  },
];

export const CATEGORIES = [
  { key: "jet", label: "Jatos", subtitle: "Light, midsize & heavy jets", icon: "airplane", count: 842, gradient: ["#1E3A5F", "#0A1628"] },
  { key: "turboprop", label: "Turbohélices", subtitle: "Single & twin turboprops", icon: "navigate", count: 456, gradient: ["#1E4D3A", "#0A2818"] },
  { key: "single_engine_piston", label: "Monomotor", subtitle: "Single-engine piston", icon: "paper-plane", count: 680, gradient: ["#3A1E5F", "#1A0A28"] },
  { key: "multi_engine_piston", label: "Multimotor", subtitle: "Multi-engine piston", icon: "swap-horizontal", count: 340, gradient: ["#5F3A1E", "#281A0A"] },
  { key: "helicopter", label: "Helicópteros", subtitle: "Turbine & piston rotorcraft", icon: "compass", count: 312, gradient: ["#1E3A5F", "#0A1F38"] },
];

export const CATEGORY_LABELS: Record<string, string> = {
  jet: "Jato", turboprop: "Turbohélice", single_engine_piston: "Monomotor",
  multi_engine_piston: "Multimotor", helicopter: "Helicóptero",
};

export const MANUFACTURERS_BY_CATEGORY: Record<string, string[]> = {
  jet: ["Cessna", "Embraer", "Bombardier", "Gulfstream", "Dassault", "HondaJet", "Hawker"],
  turboprop: ["Beechcraft", "Pilatus", "Piper", "Daher", "Cessna"],
  single_engine_piston: ["Cirrus", "Cessna", "Piper", "Diamond", "Beechcraft", "Mooney"],
  multi_engine_piston: ["Diamond", "Beechcraft", "Piper", "Cessna"],
  helicopter: ["Robinson", "Bell", "Airbus Helicopters", "Leonardo", "Sikorsky", "MD Helicopters"],
};

export const ALL_MANUFACTURERS = [
  "Cessna", "Embraer", "Bombardier", "Gulfstream", "Beechcraft", "Piper",
  "Cirrus", "Diamond", "Pilatus", "Robinson", "Dassault", "Daher",
  "Bell", "Airbus Helicopters", "Leonardo", "Sikorsky", "HondaJet",
  "Hawker", "Mooney", "MD Helicopters",
];

// Comprehensive model lists since 1980
export const MODELS_BY_MANUFACTURER: Record<string, string[]> = {
  Cessna: [
    // Jets (Citation family)
    "Citation I/SP", "Citation II/S/II", "Citation V/Ultra/Encore", "Citation Bravo",
    "Citation CJ1/CJ1+", "Citation CJ2/CJ2+", "Citation CJ3/CJ3+", "Citation CJ4",
    "Citation M2/M2 Gen2", "Citation Mustang", "Citation Excel/XLS/XLS+",
    "Citation Sovereign/Sovereign+", "Citation X/X+", "Citation Latitude",
    "Citation Longitude", "Citation Ascend",
    // Turboprops
    "208 Caravan", "208B Grand Caravan", "441 Conquest II", "425 Corsair/Conquest I",
    "408 SkyCourier",
    // Pistons
    "150/152", "172 Skyhawk", "177 Cardinal", "180/185 Skywagon",
    "182 Skylane", "206 Stationair", "210 Centurion",
    "TTx (400)", "Turbo Skylane",
    // Twins
    "310", "320 Skyknight", "337 Skymaster", "340",
    "401/402", "404 Titan", "414/414A", "421 Golden Eagle",
  ],
  Embraer: [
    "Phenom 100", "Phenom 100E", "Phenom 100EV", "Phenom 100EX",
    "Phenom 300", "Phenom 300E",
    "Legacy 450", "Legacy 500", "Legacy 600", "Legacy 650", "Legacy 650E",
    "Praetor 500", "Praetor 600",
    "Lineage 1000", "Lineage 1000E",
  ],
  Bombardier: [
    // Learjet
    "Learjet 31/31A", "Learjet 35/36", "Learjet 40/40 XR",
    "Learjet 45/45 XR", "Learjet 55", "Learjet 60/60 XR",
    "Learjet 70", "Learjet 75/75 Liberty",
    // Challenger
    "Challenger 300", "Challenger 350", "Challenger 601", "Challenger 604",
    "Challenger 605", "Challenger 650", "Challenger 3500",
    // Global
    "Global Express", "Global Express XRS", "Global 5000", "Global 5500",
    "Global 6000", "Global 6500", "Global 7500", "Global 8000",
  ],
  Gulfstream: [
    "G100 (Astra SPX)", "G150", "G200 (Galaxy)",
    "G280", "G300", "G350",
    "G400", "G450", "G500", "G550",
    "G600", "G650", "G650ER",
    "G700", "G700ER", "G800",
    "GII", "GIII", "GIV", "GIV-SP", "GV",
  ],
  Beechcraft: [
    // King Air
    "King Air 90/C90/C90A/C90GT/C90GTx", "King Air 100",
    "King Air 200/B200/B200GT", "King Air 250",
    "King Air 300/B300", "King Air 350/350i/350ER",
    "King Air 360/360ER",
    // Pistons
    "Bonanza A36/G36", "Bonanza V35",
    "Baron 55/A55/B55", "Baron 58/G58",
    "Duchess 76",
    // Jets
    "Premier I/IA", "Hawker 400XP (Beechjet)",
    // Turboprop
    "Denali",
    "1900/1900C/1900D",
  ],
  Piper: [
    // Turboprops
    "M600/SLS", "M500", "Meridian (M500)",
    "Cheyenne I/IA/II/III/IIXL/400LS",
    // Pistons - Single
    "Cherokee/Warrior/Archer", "Arrow",
    "Saratoga/Saratoga II", "Comanche",
    "Malibu/Mirage", "Matrix", "M350",
    "Archer TX/DX", "Pilot 100",
    // Pistons - Twin
    "Seminole (PA-44)", "Seneca V (PA-34)",
    "Aztec", "Navajo/Chieftain",
    "Aerostar 600/601/602/700",
  ],
  Cirrus: [
    "SR20", "SR22", "SR22T", "SR22T G6", "SR22T G7",
    "SF50 Vision Jet", "SF50 Vision Jet G2",
  ],
  Diamond: [
    "DA20 Katana", "DA40 Diamond Star", "DA40 NG",
    "DA42 Twin Star", "DA42-VI",
    "DA50 RG", "DA62", "DA62 MPP",
    "DART-550",
  ],
  Pilatus: [
    "PC-6 Turbo Porter", "PC-7", "PC-9", "PC-21",
    "PC-12", "PC-12/45", "PC-12/47", "PC-12 NG", "PC-12 NGX",
    "PC-24",
  ],
  Robinson: [
    "R22 Beta/Beta II", "R44 Raven I", "R44 Raven II",
    "R44 Cadet", "R66 Turbine",
  ],
  Dassault: [
    "Falcon 10/100", "Falcon 20/200",
    "Falcon 50/50EX", "Falcon 900/900B/900C/900EX/900LX/900DX",
    "Falcon 2000/2000EX/2000LX/2000LXS/2000S",
    "Falcon 7X", "Falcon 8X",
    "Falcon 6X", "Falcon 10X",
  ],
  Daher: [
    "TBM 700", "TBM 850", "TBM 900", "TBM 910", "TBM 930", "TBM 960",
    "Kodiak 100", "Kodiak 900",
  ],
  Bell: [
    "206B JetRanger III", "206L-4 LongRanger IV",
    "407/407GXi", "412/412EP/412EPI",
    "427", "429/429WLG",
    "505 Jet Ranger X", "525 Relentless",
  ],
  "Airbus Helicopters": [
    "H120 (EC120)", "H125 (AS350 Ecureuil)", "H130 (EC130)",
    "H135 (EC135)", "H145 (EC145/BK117)",
    "H155 (EC155)", "H160",
    "H175", "H215 (AS332)", "H225 (EC225)",
  ],
  Leonardo: [
    "AW109 (A109)", "AW109 Grand/Grand New",
    "AW119 Koala/Ke/Kx",
    "AW139", "AW169", "AW189",
  ],
  Sikorsky: [
    "S-76A/B/C/C++/D", "S-92",
    "S-70 (Black Hawk civil)", "S-61",
  ],
  HondaJet: [
    "HA-420 HondaJet", "HondaJet Elite", "HondaJet Elite S",
    "HondaJet Elite II", "HondaJet Echelon",
  ],
  Hawker: [
    "Hawker 400XP", "Hawker 750", "Hawker 800/800XP/800XPi",
    "Hawker 850XP", "Hawker 900XP", "Hawker 4000",
  ],
  Mooney: [
    "M20J (201)", "M20K (231/252)", "M20M (TLS/Bravo)",
    "M20R (Ovation)", "M20S (Eagle)", "M20TN (Acclaim Type S)",
    "M20U (Ovation Ultra)", "M20V (Acclaim Ultra)",
    "M10J", "M10T",
  ],
  "MD Helicopters": [
    "MD 500E", "MD 520N (NOTAR)", "MD 530F",
    "MD 600N", "MD 900/902 Explorer",
  ],
};

export function getManufacturersForCategory(category: string): string[] {
  if (!category) return ALL_MANUFACTURERS;
  return MANUFACTURERS_BY_CATEGORY[category] || ALL_MANUFACTURERS;
}

export function getDemoListings(filters?: {
  category?: string; manufacturer?: string; query?: string;
  maxPrice?: number; minPrice?: number; featured?: boolean;
  minYear?: number; maxYear?: number; maxHours?: number;
}): DemoListing[] {
  let results = [...DEMO_LISTINGS];
  if (filters?.featured) results = results.filter((l) => l.featured);
  if (filters?.category) results = results.filter((l) => l.category === filters.category);
  if (filters?.manufacturer) results = results.filter((l) => l.manufacturer === filters.manufacturer);
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    results = results.filter((l) =>
      l.title.toLowerCase().includes(q) || l.manufacturer.toLowerCase().includes(q) || l.model.toLowerCase().includes(q)
    );
  }
  if (filters?.minPrice) results = results.filter((l) => l.price >= filters.minPrice!);
  if (filters?.maxPrice) results = results.filter((l) => l.price <= filters.maxPrice!);
  if (filters?.minYear) results = results.filter((l) => l.year >= filters.minYear!);
  if (filters?.maxYear) results = results.filter((l) => l.year <= filters.maxYear!);
  if (filters?.maxHours) results = results.filter((l) => l.total_time_hours <= filters.maxHours!);
  return results;
}

export function getDemoListing(id: string): DemoListing | undefined {
  return DEMO_LISTINGS.find((l) => l.id === id);
}
