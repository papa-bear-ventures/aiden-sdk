/**
 * Product catalogue data.
 *
 * These products are displayed on the eCatalog page and should also
 * exist as knowledge in the configured Aiden notebook, so the AI
 * can reference them when answering customer queries.
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  specs: Record<string, string>;
  image: string; // placeholder image URL
  badge?: string;
}

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'ProLine Industrial Drill X500',
    category: 'Power Tools',
    price: 899.99,
    currency: 'EUR',
    description: 'Heavy-duty industrial drill with variable speed control, designed for professional workshops. Features a brushless motor with 20V max power and keyless chuck for quick bit changes.',
    specs: {
      'Motor': 'Brushless 20V Max',
      'Speed': '0-2000 RPM',
      'Chuck Size': '13mm Keyless',
      'Torque': '80 Nm',
      'Weight': '2.4 kg',
      'Battery': 'Li-Ion 5.0 Ah',
    },
    image: 'https://placehold.co/400x300/1a1a2e/e0e0e0?text=Drill+X500',
    badge: 'Bestseller',
  },
  {
    id: 'prod-002',
    name: 'AirTech Compressor AC-200',
    category: 'Compressors',
    price: 1249.00,
    currency: 'EUR',
    description: 'Compact yet powerful air compressor for industrial applications. Oil-free operation ensures clean air output. Ideal for pneumatic tools, spray painting, and inflation.',
    specs: {
      'Pressure': '8 bar / 116 PSI',
      'Air Flow': '200 l/min',
      'Tank Size': '50L',
      'Motor': '2.5 HP',
      'Noise Level': '68 dB',
      'Weight': '32 kg',
    },
    image: 'https://placehold.co/400x300/16213e/e0e0e0?text=Compressor+AC200',
  },
  {
    id: 'prod-003',
    name: 'SafeGuard Welding Helmet SG-Pro',
    category: 'Safety Equipment',
    price: 189.50,
    currency: 'EUR',
    description: 'Auto-darkening welding helmet with true-color lens technology. Provides exceptional clarity and UV/IR protection. 4 arc sensors for fast response in any position.',
    specs: {
      'Lens Shade': 'DIN 4/5-9/9-13',
      'Viewing Area': '100 x 93 mm',
      'Response Time': '1/25,000 sec',
      'Sensors': '4 Arc Sensors',
      'Power': 'Solar + CR2450',
      'Weight': '490 g',
    },
    image: 'https://placehold.co/400x300/0f3460/e0e0e0?text=Helmet+SG-Pro',
    badge: 'New',
  },
  {
    id: 'prod-004',
    name: 'TorqueMaster Impact Wrench TM-750',
    category: 'Power Tools',
    price: 649.00,
    currency: 'EUR',
    description: 'Professional-grade cordless impact wrench with 750 Nm of torque. 3-speed selector for precision work. Ideal for automotive, construction, and heavy machinery maintenance.',
    specs: {
      'Max Torque': '750 Nm',
      'Drive': '1/2" Square',
      'Speed': '0-2200 RPM',
      'Battery': '18V 6.0 Ah',
      'Impact Rate': '3200 IPM',
      'Weight': '3.1 kg',
    },
    image: 'https://placehold.co/400x300/1a1a2e/e0e0e0?text=Wrench+TM750',
  },
  {
    id: 'prod-005',
    name: 'LaserCut Pro LC-3000',
    category: 'Laser Equipment',
    price: 4599.00,
    currency: 'EUR',
    description: 'Desktop fiber laser cutting and engraving system. Cuts through metals up to 3mm and engraves on virtually any material. Enclosed design with integrated fume extraction.',
    specs: {
      'Laser Power': '30W Fiber',
      'Work Area': '300 x 300 mm',
      'Cutting Depth': 'Up to 3mm (metal)',
      'Speed': 'Up to 7000 mm/s',
      'Precision': '0.01 mm',
      'Software': 'LightBurn compatible',
    },
    image: 'https://placehold.co/400x300/533483/e0e0e0?text=Laser+LC3000',
    badge: 'Premium',
  },
  {
    id: 'prod-006',
    name: 'FlexiPipe Tube Bender FB-60',
    category: 'Metalworking',
    price: 2150.00,
    currency: 'EUR',
    description: 'Hydraulic tube bender for precise bending of steel, stainless steel, and copper tubes. Digital angle display ensures repeatable accuracy. Handles tubes up to 60mm diameter.',
    specs: {
      'Max Diameter': '60 mm',
      'Bending Angle': '0-180°',
      'Accuracy': '±0.5°',
      'Hydraulic Force': '12 Ton',
      'Display': 'Digital Angle',
      'Weight': '85 kg',
    },
    image: 'https://placehold.co/400x300/2b2d42/e0e0e0?text=Bender+FB60',
  },
  {
    id: 'prod-007',
    name: 'CleanStream Parts Washer CS-400',
    category: 'Cleaning Equipment',
    price: 1890.00,
    currency: 'EUR',
    description: 'Industrial parts washer with heated solvent tank and recirculation system. Suitable for engine blocks, transmission housings, and precision components. Bio-degradable solvent compatible.',
    specs: {
      'Tank Capacity': '150L',
      'Work Surface': '800 x 500 mm',
      'Load Capacity': '150 kg',
      'Pump Flow': '20 l/min',
      'Heating': 'Up to 65°C',
      'Drain': 'Side valve',
    },
    image: 'https://placehold.co/400x300/3d5a80/e0e0e0?text=Washer+CS400',
  },
  {
    id: 'prod-008',
    name: 'PowerLift Hydraulic Jack PL-5T',
    category: 'Lifting Equipment',
    price: 345.00,
    currency: 'EUR',
    description: 'Heavy-duty hydraulic floor jack with 5-ton capacity. Low-profile design fits under most vehicles. Quick-lift technology raises in half the pump strokes.',
    specs: {
      'Capacity': '5 Ton',
      'Min Height': '95 mm',
      'Max Height': '520 mm',
      'Lift Range': '425 mm',
      'Quick Lift': 'Yes',
      'Weight': '38 kg',
    },
    image: 'https://placehold.co/400x300/e63946/e0e0e0?text=Jack+PL5T',
  },
  {
    id: 'prod-009',
    name: 'VoltMax Battery Charger VM-PRO',
    category: 'Electrical Equipment',
    price: 459.00,
    currency: 'EUR',
    description: 'Professional multi-chemistry battery charger supporting Li-Ion, NiMH, and Lead-Acid. Smart diagnostics detect battery health and optimize charging curves. Charges 1-4 packs simultaneously.',
    specs: {
      'Input': '100-240V AC',
      'Output': '1-30V DC',
      'Max Current': '10A per channel',
      'Channels': '4 Independent',
      'Chemistry': 'Li-Ion, NiMH, Lead-Acid',
      'Display': 'Color LCD',
    },
    image: 'https://placehold.co/400x300/457b9d/e0e0e0?text=Charger+VM-PRO',
  },
  {
    id: 'prod-010',
    name: 'MeasurePro Digital Caliper MP-300',
    category: 'Measurement',
    price: 129.00,
    currency: 'EUR',
    description: 'High-precision digital caliper with 300mm range. Stainless steel construction with hardened measuring faces. IP54 dust and splash protection for workshop use.',
    specs: {
      'Range': '0-300 mm',
      'Resolution': '0.01 mm',
      'Accuracy': '±0.02 mm',
      'Protection': 'IP54',
      'Material': 'Hardened Stainless Steel',
      'Battery': 'CR2032 (2 years)',
    },
    image: 'https://placehold.co/400x300/264653/e0e0e0?text=Caliper+MP300',
  },
];
