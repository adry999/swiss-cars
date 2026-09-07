# Database Seeding Guide

Quickly populate your development database with realistic test data.

---

## Quick Start

```bash
# 1. Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# 2. Run seed script
npm run seed

# 3. Verify
npm run dev
# Visit http://localhost:3000
```

---

## What Gets Seeded

### Cars (3 test vehicles)
- **BMW 3 Series 2022** — Available, €35,000
- **Mercedes-Benz C-Class 2021** — Available, €42,000
- **Audi A4 2020** — Sold (for UI testing)

Each includes:
- Multilingual descriptions (ro/ru/en)
- Features list
- Placeholder image
- Price, year, mileage, transmission

### Reviews (3 test reviews)
- Multilingual content (ro/ru/en)
- Mixed ratings (5⭐, 5⭐, 4⭐)
- Featured/not-featured mix

### Partners (2 test partners)
- TCS Insurance
- Swiss Finance
- Placeholder logos

---

## Environment Variables Required

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get these from:
# 1. Supabase Dashboard > Project > Settings > API
#    - URL: Copy the project URL
#    - Service Role Key: Under "Project API Keys"
```

⚠️ **Warning**: `SUPABASE_SERVICE_ROLE_KEY` is sensitive. Never commit it to git. Use a `.env.local` file (already in `.gitignore`).

---

## Usage

### Run seeding
```bash
npm run seed
```

### Clear and re-seed
```bash
npm run seed  # Clears old data, inserts new data
```

### Manual data entry
After seeding, you can add/edit data via:
- Admin dashboard: http://localhost:3000/admin
- Supabase Studio: https://app.supabase.com

---

## Customizing Seed Data

Edit `scripts/seed-database.ts` to change test data:

```ts
const testCars = [
  {
    brand: 'Your Brand',
    model: 'Your Model',
    year: 2023,
    price: 50000,
    // ... more fields
  },
];
```

Then re-run `npm run seed`.

---

## Common Issues

### Issue: "Missing NEXT_PUBLIC_SUPABASE_URL"
**Solution**: Set environment variables before running script
```bash
export NEXT_PUBLIC_SUPABASE_URL="..."
export SUPABASE_SERVICE_ROLE_KEY="..."
npm run seed
```

### Issue: "Permission denied"
**Cause**: Service Role Key is invalid or has insufficient permissions  
**Solution**: 
1. Get a fresh key from Supabase Dashboard > Settings > API
2. Ensure key is marked as "Service Role" (not Anon)

### Issue: "No data appears"
**Solution**: 
1. Check Supabase > Tables > `cars` to verify data was inserted
2. If empty, check for errors in terminal output
3. Ensure browser isn't cached; hard refresh (Ctrl+Shift+R)

### Issue: "TypeError: cannot read property 'id'"
**Cause**: Supabase didn't return inserted data  
**Solution**: Check that tables exist and migrations have run

---

## Production Notes

⚠️ **Do NOT run `npm run seed` on production** — it clears all data!

For production, manually insert data via:
- Supabase Studio dashboard
- Admin panel (http://yourdomain.com/admin)
- Custom migration script with `IF NOT EXISTS` checks

---

## Seed Data Structure

### Cars Table
```ts
{
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  engine_cc: number;
  slug: string;  // URL-friendly identifier
  is_available: boolean;
  description: { ro: string; ru: string; en: string };
  features: { ro: string[]; ru: string[]; en: string[] };
}
```

### Reviews Table
```ts
{
  author: string;
  rating: number;  // 1-5
  content_ro: string;
  content_ru: string;
  content_en: string;
  is_featured: boolean;
}
```

### Partners Table
```ts
{
  name: string;
  logo_url: string;
  link: string;
}
```

---

## Next Steps

1. **Seed database**: `npm run seed`
2. **Start dev server**: `npm run dev`
3. **Verify data**: Visit http://localhost:3000
4. **Customize**: Edit `scripts/seed-database.ts` as needed
5. **Admin panel**: Log in at http://localhost:3000/admin to edit data

---

**Last Updated**: 2026-09-07  
**Status**: Ready to use ✓
