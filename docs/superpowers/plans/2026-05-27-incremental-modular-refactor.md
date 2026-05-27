# SwissCars Incremental Modular Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Structural cleanup of the SwissCars codebase — split large files, consolidate types, add shared components and barrel exports — without changing any business logic or features.

**Architecture:** Pre-launch tasks (1–9) are pure code moves and type annotations. Post-launch tasks (10–12) add a custom hooks layer, improved error boundaries, and component tests. No database changes, no API changes, no feature changes anywhere.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Supabase, react-hook-form, Zod, Vitest + React Testing Library, Lucide icons

---

## ⚡ PRE-LAUNCH TASKS (do before going live)

---

### Task 1: Restore public site from maintenance mode

**Files:**
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Replace the blank body with the full layout**

Open `app/[locale]/layout.tsx`. Replace lines 81–85 (the blank body) with the full layout. The file currently ends with:

```tsx
return (
      <html lang={locale} suppressHydrationWarning>
          <body suppressHydrationWarning />
      </html>
  );
}
```

Replace that `return` block with:

```tsx
    return (
        <html lang={locale} suppressHydrationWarning>
            <body suppressHydrationWarning>
                {gtmId && <GTMScript gtmId={gtmId} />}
                <ToastProvider>
                    <Preloader />
                    <NextIntlClientProvider messages={messages}>
                        <Header />
                        <main>{children}</main>
                        <Footer />
                        <WhatsAppFloat />
                    </NextIntlClientProvider>
                </ToastProvider>
                {gtmId && <GTMNoscript gtmId={gtmId} />}
                <GoogleAnalytics />
            </body>
        </html>
    );
}
```

- [ ] **Step 2: Verify the public site loads**

Run: `npm run dev`

Open http://localhost:3000 — should show the homepage with Header, Footer, Hero slider.
Open http://localhost:3000/admin — should still work and show admin dashboard.
Open http://localhost:3000/login — should still show login page.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/layout.tsx
git commit -m "feat: restore public site from maintenance mode"
```

---

### Task 2: Add HomepageContent, HeroSlide, and LeadInquiry types

**Files:**
- Modify: `lib/types/index.ts`
- Modify: `lib/actions/leads.ts`

- [ ] **Step 1: Add HomepageContent and HeroSlide to lib/types/index.ts**

Append to the end of `lib/types/index.ts`:

```typescript
// HeroSlide — used by HeroSlider component and HomepageForm
export interface HeroSlide {
    imageSrc: string;
    slogan: TranslatedField;
    title: TranslatedField;
    cta: TranslatedField;
    ctaHref: string;
}

// HomepageContent — the shape stored in site_settings under key 'homepage_content'
export interface HomepageContent {
    hero_slides: HeroSlide[];
    about_section: {
        subtitle: TranslatedField;
        title: TranslatedField;
        text: TranslatedField;
    };
    stats_section: {
        stats: Array<{
            count: number;
            suffix: string;
            label: TranslatedField;
        }>;
        partnerships: {
            title: TranslatedField;
            count: number;
            suffix: TranslatedField;
            text: TranslatedField;
        };
    };
    services_section: {
        title: TranslatedField;
        imageSrc: string;
        services: Array<{
            icon: string;
            name: TranslatedField;
            short: TranslatedField;
            full: TranslatedField;
        }>;
    };
    leasing_section: {
        title: TranslatedField;
        text1: TranslatedField;
        text2: TranslatedField;
    };
    contact_banner: {
        title: TranslatedField;
        text: TranslatedField;
        question: TranslatedField;
        cta: TranslatedField;
    };
    why_us_section: {
        title: TranslatedField;
        items: Array<{
            title: TranslatedField;
            text: TranslatedField;
        }>;
    };
}
```

- [ ] **Step 2: Move LeadInquiry schema and type into lib/types/index.ts**

Append to the end of `lib/types/index.ts` (after HomepageContent):

```typescript
// LeadInquiry — used by submitLeadInquiry server action
export const LeadInquirySchema = z.object({
    car_id: z.string().min(1, 'Eroare internă (ID mașină lipsă)'),
    car_name: z.string().min(1, 'Numele mașinii este obligatoriu').max(200),
    name: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere').max(100),
    phone: z.string().min(7, 'Numărul de telefon trebuie să aibă minim 7 caractere').max(35, 'Numărul de telefon este prea lung'),
    email: z.string().email('Format email invalid').optional().or(z.literal('')),
    message: z.string().max(2000, 'Mesajul este prea lung').optional(),
    preferred_date: z.string().max(100).optional(),
    form_type: z.string().max(50).optional(),
    source_url: z.string().url().optional(),
});

export type LeadInquiry = z.infer<typeof LeadInquirySchema>;
```

- [ ] **Step 3: Update lib/actions/leads.ts to import from lib/types**

In `lib/actions/leads.ts`, remove lines 12–33 (the inline `LeadInquirySchema` definition and `LeadInquiry` type). Replace the `z` import at the top with an import from lib/types:

Remove:
```typescript
import { z } from 'zod';

const LeadInquirySchema = z.object({
    car_id: z.string().min(1, 'Eroare internă (ID mașină lipsă)'),
    car_name: z.string().min(1, 'Numele mașinii este obligatoriu').max(200),
    name: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere').max(100),
    phone: z.string().min(7, 'Numărul de telefon trebuie să aibă minim 7 caractere').max(35, 'Numărul de telefon este prea lung'),
    email: z.string().email('Format email invalid').optional().or(z.literal('')),
    message: z.string().max(2000, 'Mesajul este prea lung').optional(),
    preferred_date: z.string().max(100).optional(),
    form_type: z.string().max(50).optional(),
    source_url: z.string().url().optional(),
});
export type LeadInquiry = {
    car_id: string;
    car_name: string;
    name: string;
    phone: string;
    email?: string;
    message?: string;
    preferred_date?: string;
    form_type?: string;
    source_url?: string;
};
```

Add at the top of `lib/actions/leads.ts` (after existing imports):
```typescript
import { LeadInquirySchema, type LeadInquiry } from '@/lib/types';
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors. If leads.ts complains about `LeadInquiry` type mismatch, ensure the Zod `z.infer` type is exported correctly (the new `z.infer<typeof LeadInquirySchema>` should produce identical shape).

- [ ] **Step 5: Commit**

```bash
git add lib/types/index.ts lib/actions/leads.ts
git commit -m "refactor: consolidate HomepageContent, HeroSlide, LeadInquiry types into lib/types"
```

---

### Task 3: Fix HeroSlider any-typed slides prop

**Files:**
- Modify: `components/home/HeroSlider.tsx`

- [ ] **Step 1: Replace local Slide interface with imported HeroSlide**

In `components/home/HeroSlider.tsx`:

Remove the local interface declarations (lines 8–18):
```typescript
interface Slide {
    imageSrc: string;
    slogan: Record<string, string>;
    title: Record<string, string>;
    cta: Record<string, string>;
    ctaHref: string;
}

interface Props {
    slides?: Slide[];
}
```

Add import at the top:
```typescript
import type { HeroSlide } from '@/lib/types';
```

Replace the `Props` interface and function signature with:
```typescript
interface Props {
    slides?: HeroSlide[];
}
```

The rest of the component is unchanged — `HeroSlide` has `slogan`, `title`, `cta` as `TranslatedField` which is `{ ro: string; ru?: string; en?: string }`. The `getText` helper uses `field[locale]` which works identically.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSlider.tsx
git commit -m "refactor: use shared HeroSlide type in HeroSlider component"
```

---

### Task 4: Split HomepageForm — create 7 sub-form components

**Files:**
- Create: `components/admin/homepage/HeroForm.tsx`
- Create: `components/admin/homepage/AboutForm.tsx`
- Create: `components/admin/homepage/StatsForm.tsx`
- Create: `components/admin/homepage/ServicesForm.tsx`
- Create: `components/admin/homepage/LeasingForm.tsx`
- Create: `components/admin/homepage/ContactBannerForm.tsx`
- Create: `components/admin/homepage/WhyUsForm.tsx`

Note: The spec listed 6 sub-forms but the actual HomepageForm has 7 sections — `contact_banner` was missed in the spec. This task creates all 7.

- [ ] **Step 1: Create HeroForm.tsx**

Create `components/admin/homepage/HeroForm.tsx`:

```tsx
'use client';

import { useFieldArray, Controller, type Control, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import type { HomepageContent } from '@/lib/types';

interface HeroFormProps {
    control: Control<HomepageContent>;
    register: UseFormRegister<HomepageContent>;
}

export default function HeroForm({ control, register }: HeroFormProps) {
    const { fields, append, remove, move } = useFieldArray({ control, name: 'hero_slides' });

    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Hero Slider Images & Texts</h2>
                <button
                    type="button"
                    onClick={() => append({ imageSrc: '', slogan: { ro: '', ru: '', en: '' }, title: { ro: '', ru: '', en: '' }, cta: { ro: '', ru: '', en: '' }, ctaHref: '#offers' })}
                    className="btn btn-outline"
                    style={{ padding: '8px 12px', fontSize: '12px', borderColor: '#ccc', color: '#333' }}
                >
                    <Plus size={14} className="me-2" /> Add Slide
                </button>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Manage the sliding images at the very top of the homepage.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {fields.map((field, index) => (
                    <div key={field.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', position: 'relative', background: '#fcfcfc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#999' }}>Slide {index + 1}</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={() => index > 0 && move(index, index - 1)} disabled={index === 0} style={{ border: 'none', background: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
                                <button type="button" onClick={() => index < fields.length - 1 && move(index, index + 1)} disabled={index === fields.length - 1} style={{ border: 'none', background: 'none', cursor: index === fields.length - 1 ? 'not-allowed' : 'pointer', opacity: index === fields.length - 1 ? 0.3 : 1 }}>↓</button>
                                <button type="button" onClick={() => remove(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '12px' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Background Image</label>
                                <Controller
                                    control={control}
                                    name={`hero_slides.${index}.imageSrc`}
                                    render={({ field: { onChange, value } }) => (
                                        <ImageUploader
                                            value={value ? [value] : []}
                                            onChange={(urls) => onChange(urls.length > 0 ? urls[0] : '')}
                                            maxFiles={1}
                                        />
                                    )}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Slogan (RO)</label>
                                        <input {...register(`hero_slides.${index}.slogan.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Slogan (RU)</label>
                                        <input {...register(`hero_slides.${index}.slogan.ru`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Slogan (EN)</label>
                                        <input {...register(`hero_slides.${index}.slogan.en`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Main Title (RO)</label>
                                        <input {...register(`hero_slides.${index}.title.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Main Title (RU)</label>
                                        <input {...register(`hero_slides.${index}.title.ru`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Main Title (EN)</label>
                                        <input {...register(`hero_slides.${index}.title.en`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Button Text (RO, RU, EN)</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input {...register(`hero_slides.${index}.cta.ro`)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                            <input {...register(`hero_slides.${index}.cta.ru`)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                            <input {...register(`hero_slides.${index}.cta.en`)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Button Link</label>
                                        <input {...register(`hero_slides.${index}.ctaHref`)} style={{ width: '100%', padding: '8px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
```

- [ ] **Step 2: Create AboutForm.tsx**

Create `components/admin/homepage/AboutForm.tsx`:

```tsx
'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface AboutFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function AboutForm({ register }: AboutFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>About Us Section</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage the subtitle, title, and descriptive text shown in the "About Us" section on the homepage.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Subtitle (RO)</label>
                        <input {...register('about_section.subtitle.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Subtitle (RU)</label>
                        <input {...register('about_section.subtitle.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Subtitle (EN)</label>
                        <input {...register('about_section.subtitle.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RO)</label>
                        <input {...register('about_section.title.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RU)</label>
                        <input {...register('about_section.title.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (EN)</label>
                        <input {...register('about_section.title.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RO)</label>
                        <textarea {...register('about_section.text.ro')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RU)</label>
                        <textarea {...register('about_section.text.ru')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (EN)</label>
                        <textarea {...register('about_section.text.en')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 3: Create StatsForm.tsx**

Create `components/admin/homepage/StatsForm.tsx`:

```tsx
'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface StatsFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function StatsForm({ register }: StatsFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Stats Counters Section</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage the 3 animated number counters and the Partnerships descriptive block.</p>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Counters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fcfcfc' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Counter {i + 1}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '4px' }}>Number</label>
                                <input type="number" {...register(`stats_section.stats.${i}.count`, { valueAsNumber: true })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '4px' }}>Suffix (+)</label>
                                <input {...register(`stats_section.stats.${i}.suffix`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                        </div>
                        <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '8px' }}>Label (RO, RU, EN)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input {...register(`stats_section.stats.${i}.label.ro`)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`stats_section.stats.${i}.label.ru`)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`stats_section.stats.${i}.label.en`)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                    </div>
                ))}
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Partnerships Block</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Title (RO)</label>
                    <input {...register('stats_section.partnerships.title.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Title (RU)</label>
                    <input {...register('stats_section.partnerships.title.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Title (EN)</label>
                    <input {...register('stats_section.partnerships.title.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '120px' }}>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Partner Count</label>
                    <input type="number" {...register('stats_section.partnerships.count', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', fontWeight: 'bold', color: 'red' }} />
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Count Suffix (RO)</label>
                        <input {...register('stats_section.partnerships.suffix.ro')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Count Suffix (RU)</label>
                        <input {...register('stats_section.partnerships.suffix.ru')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Count Suffix (EN)</label>
                        <input {...register('stats_section.partnerships.suffix.en')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RO)</label>
                    <textarea {...register('stats_section.partnerships.text.ro')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RU)</label>
                    <textarea {...register('stats_section.partnerships.text.ru')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (EN)</label>
                    <textarea {...register('stats_section.partnerships.text.en')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 4: Create ServicesForm.tsx**

Create `components/admin/homepage/ServicesForm.tsx`:

```tsx
'use client';

import { Controller, type Control, type UseFormRegister } from 'react-hook-form';
import ImageUploader from '@/components/admin/ImageUploader';
import type { HomepageContent } from '@/lib/types';

interface ServicesFormProps {
    control: Control<HomepageContent>;
    register: UseFormRegister<HomepageContent>;
}

export default function ServicesForm({ control, register }: ServicesFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Services Section</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage the 6 service tabs, image and content shown on the left panel.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Main Title (RO, RU, EN)</label>
                    <input {...register('services_section.title.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', marginBottom: '4px' }} />
                    <input {...register('services_section.title.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', marginBottom: '4px' }} />
                    <input {...register('services_section.title.en')} placeholder="EN" style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Left Panel Image</label>
                    <Controller
                        control={control}
                        name="services_section.imageSrc"
                        render={({ field: { onChange, value } }) => (
                            <ImageUploader
                                value={value ? [value] : []}
                                onChange={(urls) => onChange(urls.length > 0 ? urls[0] : '')}
                                maxFiles={1}
                            />
                        )}
                    />
                </div>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Service Tabs (max 6)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fcfcfc' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Tab {i + 1}</div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '60px' }}>
                                <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Icon</label>
                                <input {...register(`services_section.services.${i}.icon`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', fontSize: '16px' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Name (RO)</label>
                                    <input {...register(`services_section.services.${i}.name.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Short Result (RO)</label>
                                    <input {...register(`services_section.services.${i}.short.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                            </div>
                        </div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Full Description (RO)</label>
                        <textarea {...register(`services_section.services.${i}.full.ro`)} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                ))}
            </div>
        </section>
    );
}
```

- [ ] **Step 5: Create LeasingForm.tsx**

Create `components/admin/homepage/LeasingForm.tsx`:

```tsx
'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface LeasingFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function LeasingForm({ register }: LeasingFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Leasing Section</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RO)</label>
                    <input {...register('leasing_section.title.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RU)</label>
                    <input {...register('leasing_section.title.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (EN)</label>
                    <input {...register('leasing_section.title.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Block 1 (RO, RU, EN)</label>
                    <textarea {...register('leasing_section.text1.ro')} placeholder="RO" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text1.ru')} placeholder="RU" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text1.en')} placeholder="EN" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Block 2 (RO, RU, EN)</label>
                    <textarea {...register('leasing_section.text2.ro')} placeholder="RO" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text2.ru')} placeholder="RU" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text2.en')} placeholder="EN" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 6: Create ContactBannerForm.tsx**

Create `components/admin/homepage/ContactBannerForm.tsx`:

```tsx
'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface ContactBannerFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function ContactBannerForm({ register }: ContactBannerFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Contact Banner Section</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>Banner Title (RO, RU, EN)</label>
                    <input {...register('contact_banner.title.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.title.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.title.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>Banner Text (RO, RU, EN)</label>
                    <input {...register('contact_banner.text.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.text.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.text.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>Question Text (RO, RU, EN)</label>
                    <input {...register('contact_banner.question.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.question.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.question.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>CTA Button (RO, RU, EN)</label>
                    <input {...register('contact_banner.cta.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.cta.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('contact_banner.cta.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 7: Create WhyUsForm.tsx**

Create `components/admin/homepage/WhyUsForm.tsx`:

```tsx
'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface WhyUsFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function WhyUsForm({ register }: WhyUsFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Why Us (FAQ) Section</h2>
            </div>
            <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#888', marginBottom: '8px' }}>Main Title (RO, RU, EN)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input {...register('why_us_section.title.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('why_us_section.title.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('why_us_section.title.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', background: '#fcfcfc' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Question {i + 1}</div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#888' }}>Title (RO, RU, EN)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <input {...register(`why_us_section.items.${i}.title.ro`)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`why_us_section.items.${i}.title.ru`)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`why_us_section.items.${i}.title.en`)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#888' }}>Text (RO, RU, EN)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea {...register(`why_us_section.items.${i}.text.ro`)} placeholder="RO" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                            <textarea {...register(`why_us_section.items.${i}.text.ru`)} placeholder="RU" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                            <textarea {...register(`why_us_section.items.${i}.text.en`)} placeholder="EN" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
```

- [ ] **Step 8: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors. If you see errors about `register` paths (e.g. `stats_section.stats.0.count`), they come from react-hook-form's deep path inference with `HomepageContent` — add `as any` cast only on the specific register call that fails, not globally.

- [ ] **Step 9: Commit sub-forms**

```bash
git add components/admin/homepage/
git commit -m "refactor: extract HomepageForm sections into typed sub-form components"
```

---

### Task 5: Replace HomepageForm.tsx with the orchestrator

**Files:**
- Modify: `components/admin/HomepageForm.tsx`

- [ ] **Step 1: Replace HomepageForm.tsx with the slim orchestrator**

Overwrite `components/admin/HomepageForm.tsx` with:

```tsx
'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { saveSettings } from '@/lib/actions/settings';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/Toast';
import type { HomepageContent } from '@/lib/types';
import HeroForm from './homepage/HeroForm';
import AboutForm from './homepage/AboutForm';
import StatsForm from './homepage/StatsForm';
import ServicesForm from './homepage/ServicesForm';
import LeasingForm from './homepage/LeasingForm';
import ContactBannerForm from './homepage/ContactBannerForm';
import WhyUsForm from './homepage/WhyUsForm';

const DEFAULT_CONTENT: HomepageContent = {
    hero_slides: [
        {
            imageSrc: '/media/content/b-main-slider/slider.png',
            slogan: { ro: 'EȘTI GATA SĂ', ru: 'Готов к', en: 'Are you ready to' },
            title: { ro: 'CUMPERI O MAȘINĂ?', ru: 'Покупке авто?', en: 'Buy a car?' },
            cta: { ro: 'VEZI OFERTE', ru: 'Смотреть предложения', en: 'View offers' },
            ctaHref: '#offers',
        },
    ],
    about_section: {
        subtitle: { ro: 'Puțin despre noi', ru: 'Немного о нас', en: 'A little about us' },
        title: { ro: 'CINE SUNTEM NOI', ru: 'КТО МЫ', en: 'WHO WE ARE' },
        text: { ro: '', ru: '', en: '' },
    },
    stats_section: {
        stats: [
            { count: 500, suffix: '+', label: { ro: 'Masini importate', ru: 'Импортированных авто', en: 'Imported cars' } },
            { count: 265, suffix: '', label: { ro: 'Masini transportate', ru: 'Перевезенных авто', en: 'Transported cars' } },
            { count: 1450, suffix: '', label: { ro: 'Piese auto la reducere', ru: 'Автозапчастей со скидкой', en: 'Discounted car parts' } },
        ],
        partnerships: {
            title: { ro: '', ru: '', en: '' },
            count: 50,
            suffix: { ro: 'de companii', ru: 'компаниями', en: 'companies' },
            text: { ro: '', ru: '', en: '' },
        },
    },
    services_section: {
        title: { ro: 'Serviciile Noastre', ru: 'Наши Услуги', en: 'Our Services' },
        imageSrc: '/media/content/b-services/fig-1.png',
        services: [
            { icon: '🔍', name: { ro: 'Consultanta', ru: 'Консультация', en: 'Consulting' }, short: { ro: 'Gratuita', ru: 'Бесплатно', en: 'Free' }, full: { ro: '', ru: '', en: '' } },
            { icon: '🔧', name: { ro: 'Verificare', ru: 'Проверка', en: 'Checking' }, short: { ro: 'Completa', ru: 'Полная', en: 'Full' }, full: { ro: '', ru: '', en: '' } },
            { icon: '🚚', name: { ro: 'Transport', ru: 'Транспорт', en: 'Transport' }, short: { ro: 'Sigur', ru: 'Надежный', en: 'Safe' }, full: { ro: '', ru: '', en: '' } },
            { icon: '🏷️', name: { ro: 'Vamuire', ru: 'Таможня', en: 'Customs' }, short: { ro: 'Rapida', ru: 'Быстро', en: 'Fast' }, full: { ro: '', ru: '', en: '' } },
            { icon: '⚙️', name: { ro: 'Inmatriculare', ru: 'Регистрация', en: 'Registration' }, short: { ro: 'Moldova', ru: 'Молдова', en: 'Moldova' }, full: { ro: '', ru: '', en: '' } },
            { icon: '🛡️', name: { ro: 'Leasing', ru: 'Лизинг', en: 'Leasing' }, short: { ro: 'Inclus', ru: 'Включен', en: 'Included' }, full: { ro: '', ru: '', en: '' } },
        ],
    },
    leasing_section: {
        title: { ro: 'Leasing Auto', ru: 'Авто Лизинг', en: 'Car Leasing' },
        text1: { ro: '', ru: '', en: '' },
        text2: { ro: '', ru: '', en: '' },
    },
    contact_banner: {
        title: { ro: '', ru: '', en: '' },
        text: { ro: '', ru: '', en: '' },
        question: { ro: '', ru: '', en: '' },
        cta: { ro: '', ru: '', en: '' },
    },
    why_us_section: {
        title: { ro: 'De ce să ne alegi?', ru: 'Почему выбирают нас?', en: 'Why choose us?' },
        items: [
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
        ],
    },
};

export default function HomepageForm({ initialData }: { initialData?: HomepageContent }) {
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const { control, register, handleSubmit } = useForm<HomepageContent>({
        defaultValues: initialData || DEFAULT_CONTENT,
    });

    const onSubmit = async (data: HomepageContent) => {
        setIsSaving(true);
        try {
            const res = await saveSettings('homepage_content', data);
            if (res.success) {
                toast.success('Homepage content saved successfully!');
            } else {
                toast.error('Failed to save homepage content.');
            }
        } catch {
            toast.error('Error saving homepage content.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Homepage Editor</h1>
                <button type="button" onClick={handleSubmit(onSubmit)} className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? <Loader2 className="spinner" size={16} /> : <Save size={16} className="me-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <HeroForm control={control} register={register} />
                <AboutForm register={register} />
                <StatsForm register={register} />
                <ServicesForm control={control} register={register} />
                <LeasingForm register={register} />
                <ContactBannerForm register={register} />
                <WhyUsForm register={register} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? <Loader2 className="spinner" size={16} /> : <Save size={16} className="me-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Verify the admin homepage editor still works**

Run: `npm run dev`

Navigate to http://localhost:3000/admin/homepage — the editor should load all 7 sections. Fill in a field in each section, click Save, refresh the page, and verify values are persisted.

- [ ] **Step 4: Commit**

```bash
git add components/admin/HomepageForm.tsx
git commit -m "refactor: reduce HomepageForm to orchestrator, delegating to 7 typed sub-forms"
```

---

### Task 6: Split CarEditForm into orchestrator + 3 tab components

**Files:**
- Create: `components/admin/car-edit/GeneralInfoTab.tsx`
- Create: `components/admin/car-edit/SpecsTab.tsx`
- Create: `components/admin/car-edit/ImagesTab.tsx`
- Modify: `components/admin/CarEditForm.tsx`

- [ ] **Step 1: Create GeneralInfoTab.tsx**

Create `components/admin/car-edit/GeneralInfoTab.tsx`:

```tsx
'use client';

import type { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';
import type { Car } from '@/lib/types';
import styles from '../CarEditForm.module.css';

interface GeneralInfoTabProps {
    register: UseFormRegister<Car>;
    watch: UseFormWatch<Car>;
    errors: FieldErrors<Car>;
    descLang: 'ro' | 'ru' | 'en';
    onDescLangChange: (lang: 'ro' | 'ru' | 'en') => void;
}

export default function GeneralInfoTab({ register, errors, descLang, onDescLangChange }: GeneralInfoTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.field}>
                <label>Brand</label>
                <input {...register('brand')} placeholder="e.g. Audi" />
                {errors.brand && <span className={styles.error}>{errors.brand.message}</span>}
            </div>
            <div className={styles.field}>
                <label>Model</label>
                <input {...register('model')} placeholder="e.g. A6 Allroad" />
                {errors.model && <span className={styles.error}>{errors.model.message}</span>}
            </div>
            <div className={styles.field}>
                <label>URL Slug</label>
                <input {...register('slug')} placeholder="unique-car-slug" />
                {errors.slug && <span className={styles.error}>{errors.slug.message}</span>}
            </div>
            <div className={styles.field}>
                <label>Price (€)</label>
                <input type="number" {...register('price', { valueAsNumber: true })} />
                {errors.price && <span className={styles.error}>{errors.price.message}</span>}
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <div className={styles.descTabs}>
                    {(['ro', 'ru', 'en'] as const).map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            className={`${styles.descTabBtn} ${descLang === lang ? styles.descTabActive : ''}`}
                            onClick={() => onDescLangChange(lang)}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
                <textarea
                    {...register(`description.${descLang}` as any)}
                    placeholder={`Detailed description (${descLang.toUpperCase()})...`}
                    rows={8}
                />
            </div>
            <div className={styles.field}>
                <div className={styles.checkbox}>
                    <input type="checkbox" {...register('is_available')} id="is_available" />
                    <label htmlFor="is_available">Available for sale</label>
                </div>
            </div>
            <div className={styles.field}>
                <div className={styles.checkbox}>
                    <input type="checkbox" {...register('is_featured')} id="is_featured" />
                    <label htmlFor="is_featured">Featured on homepage</label>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Create SpecsTab.tsx**

Create `components/admin/car-edit/SpecsTab.tsx`:

```tsx
'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { Car } from '@/lib/types';
import styles from '../CarEditForm.module.css';

interface SpecsTabProps {
    register: UseFormRegister<Car>;
}

export default function SpecsTab({ register }: SpecsTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.field}>
                <label>Year</label>
                <input type="number" {...register('year', { valueAsNumber: true })} />
            </div>
            <div className={styles.field}>
                <label>Mileage (km)</label>
                <input type="number" {...register('mileage', { valueAsNumber: true })} />
            </div>
            <div className={styles.field}>
                <label>Fuel Type</label>
                <select {...register('fuel_type')}>
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                </select>
            </div>
            <div className={styles.field}>
                <label>Transmission</label>
                <select {...register('transmission')}>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                </select>
            </div>
            <div className={styles.field}>
                <label>Engine (cm³)</label>
                <input type="number" {...register('engine_cc', { valueAsNumber: true })} />
            </div>
            <div className={styles.field}>
                <label>Drive</label>
                <select {...register('drive')}>
                    <option value="4x4">4x4</option>
                    <option value="fwd">FWD</option>
                    <option value="rwd">RWD</option>
                </select>
            </div>
            <div className={styles.field}>
                <label>Exterior Color</label>
                <input {...register('color_exterior')} placeholder="e.g. Silver Metallic" />
            </div>
            <div className={styles.field}>
                <label>Interior Color</label>
                <input {...register('color_interior')} placeholder="e.g. Black Leather" />
            </div>
            <div className={styles.field}>
                <label>Body Type</label>
                <input {...register('body_type')} placeholder="e.g. SUV, Sedan" />
            </div>
            <div className={styles.field}>
                <label>Seats</label>
                <input type="number" {...register('seats', { valueAsNumber: true })} />
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Create ImagesTab.tsx**

Create `components/admin/car-edit/ImagesTab.tsx`:

```tsx
'use client';

import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { Car } from '@/lib/types';
import ImageUploader from '@/components/admin/ImageUploader';
import styles from '../CarEditForm.module.css';

interface ImagesTabProps {
    watch: UseFormWatch<Car>;
    setValue: UseFormSetValue<Car>;
    maxImages: number;
    initialImages: Array<{ url: string; is_primary: boolean }>;
}

export default function ImagesTab({ watch, setValue, maxImages, initialImages }: ImagesTabProps) {
    const carImages = watch('car_images' as any) || initialImages || [];
    const images = carImages.map((img: any) => typeof img === 'string' ? img : img.url);

    return (
        <div>
            {images.length > 0 && (
                <div className={styles.mainImageNotice}>
                    <p><strong>Note on Main Image:</strong> The first image in the list above is automatically used as the main/featured photo for the car card.</p>
                </div>
            )}
            <ImageUploader
                value={images}
                onChange={(urls) => {
                    setValue('car_images' as any, urls.map((url, i) => ({ url, is_primary: i === 0 })));
                }}
                maxFiles={maxImages}
            />
        </div>
    );
}
```

- [ ] **Step 4: Replace CarEditForm.tsx with the orchestrator**

Overwrite `components/admin/CarEditForm.tsx` with:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, FileText, Settings, AlertCircle, X } from 'lucide-react';
import { CarSchema, type Car } from '@/lib/types';
import { saveCar } from '@/lib/actions/cars';
import GeneralInfoTab from './car-edit/GeneralInfoTab';
import SpecsTab from './car-edit/SpecsTab';
import ImagesTab from './car-edit/ImagesTab';
import styles from './CarEditForm.module.css';

type Props = {
    initialData?: Car;
    maxImages?: number;
};

export default function CarEditForm({ initialData, maxImages = 25 }: Props) {
    const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'images'>('general');
    const [descLang, setDescLang] = useState<'ro' | 'ru' | 'en'>('ro');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const router = useRouter();

    const initialImages = useMemo(() => {
        if (!initialData?.car_images) return [];
        return [...initialData.car_images].sort((a, b) => {
            if (a.is_primary) return -1;
            if (b.is_primary) return 1;
            return 0;
        });
    }, [initialData]);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Car>({
        resolver: zodResolver(CarSchema) as any,
        defaultValues: initialData || { is_available: true, is_featured: false, year: new Date().getFullYear() },
    });

    const onInvalid = () => {
        setFormError('Please check the form for errors. Some required fields might be missing or invalid.');
    };

    const onSubmit = async (data: Car) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            const result = await saveCar(data as any);
            if (result.success) {
                router.push('/admin/inventory');
                router.refresh();
            }
        } catch {
            setFormError('Failed to save car. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit as any, onInvalid)} className={styles.form}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button type="button" onClick={() => router.back()} className={styles.backBtn}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className={styles.title}>
                        {initialData ? `Edit ${initialData.brand} ${initialData.model}` : 'Add New Car'}
                    </h1>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? <Loader2 className={styles.spinner} /> : <Save size={18} className="me-2" />}
                    Save Car
                </button>
            </header>

            <div className={styles.tabs}>
                {([
                    { id: 'general', icon: <FileText size={18} />, label: 'General Info' },
                    { id: 'specs', icon: <Settings size={18} />, label: 'Technical Specs' },
                    { id: 'images', icon: <ImageIcon size={18} />, label: 'Images' },
                ] as const).map(({ id, icon, label }) => (
                    <button
                        key={id}
                        type="button"
                        className={`${styles.tab} ${activeTab === id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {(formError || Object.keys(errors).length > 0) && (
                    <div className={styles.formError}>
                        <AlertCircle size={20} />
                        <span>{formError || 'There are errors in the form. Please check all tabs.'}</span>
                        {formError && (
                            <button type="button" className={styles.dismissBtn} onClick={() => setFormError(null)}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}

                {activeTab === 'general' && (
                    <GeneralInfoTab
                        register={register}
                        watch={watch}
                        errors={errors}
                        descLang={descLang}
                        onDescLangChange={setDescLang}
                    />
                )}
                {activeTab === 'specs' && <SpecsTab register={register} />}
                {activeTab === 'images' && (
                    <ImagesTab
                        watch={watch}
                        setValue={setValue}
                        maxImages={maxImages}
                        initialImages={initialImages}
                    />
                )}
            </div>
        </form>
    );
}
```

- [ ] **Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 6: Verify CarEditForm still works**

Run: `npm run dev`

Navigate to http://localhost:3000/admin/inventory/new — all 3 tabs should render. Fill in General Info and Specs fields, add an image, and save. Verify the car appears in the inventory list.

- [ ] **Step 7: Commit**

```bash
git add components/admin/CarEditForm.tsx components/admin/car-edit/
git commit -m "refactor: split CarEditForm into orchestrator + GeneralInfoTab, SpecsTab, ImagesTab"
```

---

### Task 7: Create shared admin UI components

**Files:**
- Create: `components/admin/AdminPageHeader.tsx`
- Create: `components/admin/FormErrorMessage.tsx`
- Create: `components/ui/LoadingSpinner.tsx`
- Create: `components/ui/EmptyState.tsx`

- [ ] **Step 1: Create AdminPageHeader.tsx**

Create `components/admin/AdminPageHeader.tsx`:

```tsx
import Link from 'next/link';

interface AdminPageHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        href: string;
        icon?: React.ReactNode;
    };
}

export default function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{title}</h1>
                {subtitle && <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>{subtitle}</p>}
            </div>
            {action && (
                <Link href={action.href} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {action.icon}
                    {action.label}
                </Link>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Create FormErrorMessage.tsx**

Create `components/admin/FormErrorMessage.tsx`:

```tsx
import { AlertCircle } from 'lucide-react';

interface FormErrorMessageProps {
    message?: string;
}

export default function FormErrorMessage({ message }: FormErrorMessageProps) {
    if (!message) return null;
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '16px',
        }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{message}</span>
        </div>
    );
}
```

- [ ] **Step 3: Create LoadingSpinner.tsx**

Create `components/ui/LoadingSpinner.tsx`:

```tsx
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

const sizeMap = { sm: 16, md: 24, lg: 32 };

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
    const px = sizeMap[size];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <Loader2 size={px} style={{ animation: 'spin 1s linear infinite' }} />
            {label && <span style={{ fontSize: size === 'sm' ? '12px' : '14px' }}>{label}</span>}
        </div>
    );
}
```

- [ ] **Step 4: Create EmptyState.tsx**

Create `components/ui/EmptyState.tsx`:

```tsx
import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            color: '#9ca3af',
            textAlign: 'center',
        }}>
            {icon && <div style={{ marginBottom: '16px', opacity: 0.5 }}>{icon}</div>}
            <p style={{ fontWeight: '600', fontSize: '16px', color: '#6b7280', margin: '0 0 6px' }}>{title}</p>
            {description && <p style={{ fontSize: '14px', margin: 0 }}>{description}</p>}
        </div>
    );
}
```

- [ ] **Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/admin/AdminPageHeader.tsx components/admin/FormErrorMessage.tsx components/ui/LoadingSpinner.tsx components/ui/EmptyState.tsx
git commit -m "feat: add shared AdminPageHeader, FormErrorMessage, LoadingSpinner, EmptyState components"
```

---

### Task 8: Add barrel exports

**Files:**
- Create: `components/ui/index.ts`
- Create: `components/admin/index.ts`

- [ ] **Step 1: Create components/ui/index.ts**

Create `components/ui/index.ts`:

```typescript
export { default as Pagination } from './Pagination';
export { useToast, ToastProvider } from './Toast';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as EmptyState } from './EmptyState';
export { default as Reveal } from './Reveal';
export { default as Preloader } from './Preloader';
export { default as WhatsAppFloat } from './WhatsAppFloat';
```

- [ ] **Step 2: Create components/admin/index.ts**

Create `components/admin/index.ts`:

```typescript
export { default as AdminPageHeader } from './AdminPageHeader';
export { default as FormErrorMessage } from './FormErrorMessage';
export { default as DataTable } from './DataTable';
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminLayoutClient } from './AdminLayoutClient';
export { default as ImageUploader } from './ImageUploader';
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors. If a module re-exported from `components/ui/Toast` doesn't exist (e.g. `ToastProvider` is a named export from `Toast/ToastContext.tsx` not `Toast/index.ts`), adjust the path. Check `components/ui/Toast/index.ts` to see what it exports, and match accordingly.

- [ ] **Step 4: Commit**

```bash
git add components/ui/index.ts components/admin/index.ts
git commit -m "refactor: add barrel exports to components/ui and components/admin"
```

---

### Task 9: Final pre-launch verification

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`

Expected: 0 errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`

Expected: 0 errors (warnings OK).

- [ ] **Step 3: Run tests**

Run: `npm test`

Expected: all existing tests pass (types, sanitize, rateLimit, Pagination).

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`

Checklist:
- [ ] http://localhost:3000 — public homepage loads with Header, Hero slider, all sections, Footer
- [ ] http://localhost:3000/inventory — car listings load
- [ ] http://localhost:3000/admin — dashboard loads
- [ ] http://localhost:3000/admin/inventory — car table loads
- [ ] http://localhost:3000/admin/inventory/new — CarEditForm with 3 tabs loads
- [ ] http://localhost:3000/admin/homepage — all 7 editor sections visible, save works

- [ ] **Step 5: Production build check**

Run: `npm run build`

Expected: successful build, no TypeScript or ESLint errors.

---

## 🔄 POST-LAUNCH TASKS (do after go-live)

---

### Task 10: Custom hooks layer

**Files:**
- Create: `lib/hooks/usePagination.ts`
- Create: `lib/hooks/useCarFilters.ts`
- Create: `lib/hooks/useImageUpload.ts`
- Create: `lib/hooks/useAdminTable.ts`

- [ ] **Step 1: Write failing test for usePagination**

Create `lib/hooks/usePagination.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
    it('starts at page 1', () => {
        const { result } = renderHook(() => usePagination(100, 20));
        expect(result.current.page).toBe(1);
    });

    it('calculates totalPages correctly', () => {
        const { result } = renderHook(() => usePagination(100, 20));
        expect(result.current.totalPages).toBe(5);
    });

    it('hasPrev is false on first page', () => {
        const { result } = renderHook(() => usePagination(100, 20));
        expect(result.current.hasPrev).toBe(false);
    });

    it('hasNext is true when not on last page', () => {
        const { result } = renderHook(() => usePagination(100, 20));
        expect(result.current.hasNext).toBe(true);
    });

    it('setPage updates page', () => {
        const { result } = renderHook(() => usePagination(100, 20));
        act(() => result.current.setPage(3));
        expect(result.current.page).toBe(3);
        expect(result.current.hasPrev).toBe(true);
    });

    it('hasNext is false on last page', () => {
        const { result } = renderHook(() => usePagination(100, 20));
        act(() => result.current.setPage(5));
        expect(result.current.hasNext).toBe(false);
    });

    it('setPage clamps to valid range', () => {
        const { result } = renderHook(() => usePagination(100, 20));
        act(() => result.current.setPage(0));
        expect(result.current.page).toBe(1);
        act(() => result.current.setPage(99));
        expect(result.current.page).toBe(5);
    });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npx vitest run lib/hooks/usePagination.test.ts`

Expected: FAIL — `usePagination` module not found.

- [ ] **Step 3: Implement usePagination**

Create `lib/hooks/usePagination.ts`:

```typescript
import { useState } from 'react';

export function usePagination(total: number, perPage: number) {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const [page, setPageRaw] = useState(1);

    const setPage = (p: number) => setPageRaw(Math.min(totalPages, Math.max(1, p)));

    return {
        page,
        setPage,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `npx vitest run lib/hooks/usePagination.test.ts`

Expected: all 7 tests PASS.

- [ ] **Step 5: Create useAdminTable**

Create `lib/hooks/useAdminTable.ts`:

```typescript
import { useState } from 'react';

export function useAdminTable<T>() {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState('');

    const toggleSort = (key: keyof T) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    return { sortKey, sortDir, toggleSort, search, setSearch };
}
```

- [ ] **Step 6: Create useCarFilters**

Create `lib/hooks/useCarFilters.ts`:

```typescript
'use client';

import { useState } from 'react';

export interface CarFilters {
    brand?: string;
    body_type?: string;
    fuel_type?: string;
    min_price?: number;
    max_price?: number;
}

export function useCarFilters(initial: CarFilters = {}) {
    const [filters, setFilters] = useState<CarFilters>(initial);

    const setFilter = <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => setFilters({});

    const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

    return { filters, setFilter, resetFilters, hasActiveFilters };
}
```

- [ ] **Step 7: Create useImageUpload**

Create `lib/hooks/useImageUpload.ts`:

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export function useImageUpload(bucket: string) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File): Promise<string | null> => {
        setUploading(true);
        setError(null);
        const supabase = createClient();
        const ext = file.name.split('.').pop();
        const path = `${uuidv4()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: false });

        setUploading(false);

        if (uploadError) {
            setError(uploadError.message);
            return null;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    };

    return { upload, uploading, error };
}
```

- [ ] **Step 8: Run all tests**

Run: `npm test`

Expected: all tests pass including the new usePagination tests.

- [ ] **Step 9: Commit**

```bash
git add lib/hooks/
git commit -m "feat: add usePagination, useAdminTable, useCarFilters, useImageUpload hooks"
```

---

### Task 11: Improve error boundaries

**Files:**
- Modify: `app/[locale]/error.tsx`
- Modify: `app/admin/error.tsx`

- [ ] **Step 1: Read the current error.tsx files**

Read `app/[locale]/error.tsx` and `app/admin/error.tsx` to understand the current state before modifying.

- [ ] **Step 2: Update public error page**

Replace `app/[locale]/error.tsx` content with (preserve any existing imports at the top):

```tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('[Public page error]', error);
    }, [error]);

    return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>Oops</h1>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>Something went wrong loading this page.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={reset}
                    style={{ padding: '10px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                    Try again
                </button>
                <Link
                    href="/"
                    style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '6px', color: '#333', textDecoration: 'none', fontWeight: '600' }}
                >
                    Return to homepage
                </Link>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Update admin error page**

Replace `app/admin/error.tsx` content with:

```tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('[Admin error]', { message: error.message, digest: error.digest });
    }, [error]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: '24px', maxWidth: '400px' }}>{error.message || 'An unexpected error occurred in the admin panel.'}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={reset}
                    style={{ padding: '10px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                    Try again
                </button>
                <Link
                    href="/admin"
                    style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '6px', color: '#333', textDecoration: 'none', fontWeight: '600' }}
                >
                    Go to dashboard
                </Link>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/error.tsx app/admin/error.tsx
git commit -m "feat: improve error boundaries with recovery CTAs and error logging"
```

---

### Task 12: Component tests

**Files:**
- Modify: `components/ui/Pagination.test.tsx` (already exists — extend it)
- Create: `components/cars/CarCard.test.tsx`
- Create: `components/cars/FavoriteButton.test.tsx`

- [ ] **Step 1: Read the existing Pagination test**

Read `components/ui/Pagination.test.tsx` to understand current coverage before adding.

- [ ] **Step 2: Write failing CarCard test**

Create `components/cars/CarCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CarCard from './CarCard';
import type { Car } from '@/lib/types';

const mockCar: Car = {
    id: 'abc-123',
    slug: 'audi-a6-2022',
    brand: 'Audi',
    model: 'A6',
    year: 2022,
    price: 35000,
    is_available: true,
    is_featured: false,
    car_images: [{ url: 'https://example.com/car.jpg', is_primary: true }],
};

describe('CarCard', () => {
    it('renders brand and model', () => {
        render(<CarCard car={mockCar} />);
        expect(screen.getByText(/Audi/i)).toBeDefined();
        expect(screen.getByText(/A6/i)).toBeDefined();
    });

    it('renders the price', () => {
        render(<CarCard car={mockCar} />);
        expect(screen.getByText(/35/)).toBeDefined();
    });

    it('renders without crashing when car_images is empty', () => {
        const carWithNoImages = { ...mockCar, car_images: [] };
        expect(() => render(<CarCard car={carWithNoImages} />)).not.toThrow();
    });

    it('renders without crashing when car_images is undefined', () => {
        const carWithNoImages = { ...mockCar, car_images: undefined };
        expect(() => render(<CarCard car={carWithNoImages} />)).not.toThrow();
    });
});
```

- [ ] **Step 3: Run CarCard test to confirm it fails**

Run: `npx vitest run components/cars/CarCard.test.tsx`

Expected: FAIL — if CarCard has missing image handling issues, the test surfaces them. If the test fails due to missing mocks, check `test-setup.ts` — it should already mock `next/image`.

- [ ] **Step 4: Fix any CarCard issues and re-run**

If `CarCard.test.tsx` fails because the component crashes on missing images, open `components/cars/CarCard.tsx` and ensure the primary image lookup has a fallback:

```tsx
const primaryImage = car.car_images?.find(img => img.is_primary)?.url
    ?? car.car_images?.[0]?.url
    ?? '/media/general/placeholder-car.png';
```

Run: `npx vitest run components/cars/CarCard.test.tsx`

Expected: all 4 tests PASS.

- [ ] **Step 5: Write FavoriteButton test**

Create `components/cars/FavoriteButton.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from './FavoriteButton';

describe('FavoriteButton', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders without crashing', () => {
        expect(() => render(<FavoriteButton carId="car-1" />)).not.toThrow();
    });

    it('toggles favorite state on click', () => {
        render(<FavoriteButton carId="car-1" />);
        const btn = screen.getByRole('button');
        fireEvent.click(btn);
        expect(localStorage.getItem('favorites')).toContain('car-1');
    });

    it('removes from favorites when clicked again', () => {
        localStorage.setItem('favorites', JSON.stringify(['car-1']));
        render(<FavoriteButton carId="car-1" />);
        const btn = screen.getByRole('button');
        fireEvent.click(btn);
        const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
        expect(saved).not.toContain('car-1');
    });
});
```

- [ ] **Step 6: Run FavoriteButton test**

Run: `npx vitest run components/cars/FavoriteButton.test.tsx`

Expected: all 3 tests PASS. If FavoriteButton uses a different localStorage key than `'favorites'`, adjust the test to match the actual key used in the component.

- [ ] **Step 7: Run full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add components/cars/CarCard.test.tsx components/cars/FavoriteButton.test.tsx lib/hooks/usePagination.test.ts
git commit -m "test: add CarCard, FavoriteButton component tests and usePagination hook tests"
```

---

## Summary

| Phase | Tasks | Time |
|---|---|---|
| Pre-launch | 1–9 (restore site, types, splits, shared components, barrel exports) | ~6–8 hrs |
| Post-launch | 10–12 (hooks, error boundaries, tests) | ~6–8 hrs |

All pre-launch changes are code moves and type annotations with zero logic changes.
