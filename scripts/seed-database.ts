/**
 * Seed database with test cars, reviews, partners, and settings.
 * Usage: npx tsx scripts/seed-database.ts
 *
 * This script populates Supabase with realistic data for development/testing.
 * Run this after migrations but before starting the app.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testCars = [
  {
    brand: 'BMW',
    model: '3 Series',
    year: 2022,
    price: 35000,
    mileage: 15000,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    engine_cc: 1998,
    slug: 'bmw-3-series-2022-1',
    is_available: true,
    description: {
      ro: 'BMW 3 Series 2022, impecabil, full option, istoric complet.',
      ru: 'BMW 3 Series 2022, идеальное состояние, все опции, полная история.',
      en: 'BMW 3 Series 2022, immaculate condition, full options, complete history.',
    },
    features: {
      ro: ['Climatizare', 'Piele', 'Navigatie', 'Senzori parcare'],
      ru: ['Кондиционер', 'Кожа', 'Навигация', 'Датчики парковки'],
      en: ['Air conditioning', 'Leather', 'Navigation', 'Parking sensors'],
    },
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2021,
    price: 42000,
    mileage: 25000,
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    engine_cc: 1998,
    slug: 'mercedes-c-class-2021-1',
    is_available: true,
    description: {
      ro: 'Mercedes-Benz C-Class 2021, impecabil, service complet.',
      ru: 'Mercedes-Benz C-Class 2021, идеальное состояние, полное обслуживание.',
      en: 'Mercedes-Benz C-Class 2021, excellent condition, full service history.',
    },
    features: {
      ro: ['Ambiance LED', 'Sunroof', 'Navigatie AMG', 'Incarcare wireless'],
      ru: ['Светодиодное освещение', 'Панорамная крыша', 'Навигация AMG', 'Беспроводная зарядка'],
      en: ['LED ambiance', 'Panoramic roof', 'AMG navigation', 'Wireless charging'],
    },
  },
  {
    brand: 'Audi',
    model: 'A4',
    year: 2020,
    price: 38000,
    mileage: 32000,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    engine_cc: 1968,
    slug: 'audi-a4-2020-1',
    is_available: false,
    description: {
      ro: 'Audi A4 2020, vandut.',
      ru: 'Audi A4 2020, продано.',
      en: 'Audi A4 2020, sold.',
    },
    features: {
      ro: ['Quattro AWD', 'Matrix LED', 'Bang & Olufsen'],
      ru: ['Quattro AWD', 'Матричные светодиоды', 'Bang & Olufsen'],
      en: ['Quattro AWD', 'Matrix LED', 'Bang & Olufsen'],
    },
  },
];

const testReviews = [
  {
    author: 'Ion M.',
    rating: 5,
    content_ro: 'Excelent! Masina chiar cum se vede in anunt, cu toata documentatia in regula. Recomand SwissCars!',
    content_ru: 'Отлично! Машина именно такая, как на фото, вся документация в порядке. Рекомендую SwissCars!',
    content_en: 'Excellent! The car is exactly as advertised, all documentation in order. Highly recommend SwissCars!',
    is_featured: true,
  },
  {
    author: 'Alexandr K.',
    rating: 5,
    content_ro: 'Proces rapid si transparent. Masina livrare pe timp. Multumesc!',
    content_ru: 'Быстрый и прозрачный процесс. Машина доставлена вовремя. Спасибо!',
    content_en: 'Fast and transparent process. Car delivered on time. Thank you!',
    is_featured: true,
  },
  {
    author: 'Maria S.',
    rating: 4,
    content_ro: 'Bun. Ar putea fi mai rapida livrarea, dar masina e in stare buna.',
    content_ru: 'Хорошо. Доставка могла быть быстрее, но машина в хорошем состоянии.',
    content_en: 'Good. Delivery could be faster, but the car is in good condition.',
    is_featured: false,
  },
];

const testPartners = [
  {
    name: 'TCS Insurance',
    logo_url: 'https://via.placeholder.com/200x100?text=TCS',
    link: 'https://www.tcs.ch',
  },
  {
    name: 'Swiss Finance',
    logo_url: 'https://via.placeholder.com/200x100?text=SwissFinance',
    link: 'https://example.com',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('car_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cars').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert cars
    console.log('\n📍 Inserting test cars...');
    for (const car of testCars) {
      const { data, error } = await supabase
        .from('cars')
        .insert([car])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting car ${car.brand} ${car.model}:`, error);
        continue;
      }

      console.log(`✓ ${car.brand} ${car.model} (${car.year})`);

      // Add placeholder image
      if (data?.id) {
        await supabase.from('car_images').insert([
          {
            car_id: data.id,
            url: `https://via.placeholder.com/400x300?text=${car.brand}+${car.model}`,
            is_primary: true,
            sort_order: 0,
          },
        ]);
      }
    }

    // Insert reviews
    console.log('\n⭐ Inserting test reviews...');
    for (const review of testReviews) {
      const { error } = await supabase
        .from('reviews')
        .insert([review]);

      if (error) {
        console.error(`❌ Error inserting review by ${review.author}:`, error);
        continue;
      }

      console.log(`✓ Review by ${review.author} (${review.rating}⭐)`);
    }

    // Insert partners
    console.log('\n🤝 Inserting test partners...');
    for (const partner of testPartners) {
      const { error } = await supabase
        .from('partners')
        .insert([partner]);

      if (error) {
        console.error(`❌ Error inserting partner ${partner.name}:`, error);
        continue;
      }

      console.log(`✓ ${partner.name}`);
    }

    console.log('\n✅ Database seeding complete!');
    console.log('\nNext steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Visit http://localhost:3000 to see seeded data');
    console.log('3. Admin: visit http://localhost:3000/admin to manage data');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
