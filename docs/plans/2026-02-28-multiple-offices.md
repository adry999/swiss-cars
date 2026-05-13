# Multiple Office Locations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow admins to manage a dynamic list of offices (Switzerland, Moldova, Romania, etc.) shown in the footer and on the contact page.

**Architecture:** Offices are stored as a JSON array under the `offices` key inside the existing `site_config` blob in `site_settings`. No new DB table or migration needed. Three files change: `SettingsForm.tsx` (admin UI), `Footer.tsx` (footer loop), `ContactPageClient.tsx` + its page (contact section). One i18n key added per locale.

**Tech Stack:** Next.js 16 App Router, TypeScript, CSS Modules, next-intl, Lucide icons

---

## Task 1: Admin — "Office Locations" section in SettingsForm

**Files:**
- Modify: `app/admin/settings/SettingsForm.tsx`

The `settings` state object already holds `site_config`. We add `offices: Office[]` to it. No server action changes needed — `saveSettings("site_config", settings)` already saves the whole object.

**Step 1: Read the file**

Open `app/admin/settings/SettingsForm.tsx` to confirm the exact HR separator locations and existing imports.

**Step 2: Add the Office type and helper at the top of the file** (after the imports, before the component):

```ts
type Office = {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
};
```

**Step 3: Add the "Office Locations" section**

Place it immediately after the closing `</section>` of "Contact Information" (after its `<hr>`), before the "Social Media Links" section.

```tsx
<hr style={{ borderTop: "1px solid #eee", margin: 0 }} />

{/* Office Locations */}
<section className={styles.section}>
  <h2 className={styles.subtitle}>
    <MapPin size={16} /> Office Locations
  </h2>

  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    {(settings.offices || []).map((office: Office) => (
      <div
        key={office.id}
        style={{
          border: "1px solid var(--color-gray-2)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          background: "var(--color-gray)",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setSettings({
              ...settings,
              offices: (settings.offices || []).filter(
                (o: Office) => o.id !== office.id
              ),
            })
          }
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            padding: "4px 10px",
            background: "#fee2e2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Remove
        </button>

        <div className={styles.grid} style={{ marginTop: "4px" }}>
          <div className={styles.field}>
            <label>Office Name</label>
            <input
              placeholder="e.g. Switzerland"
              value={office.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  offices: (settings.offices || []).map((o: Office) =>
                    o.id === office.id ? { ...o, name: e.target.value } : o
                  ),
                })
              }
            />
          </div>
          <div className={styles.field}>
            <label><Phone size={14} /> Phone</label>
            <input
              placeholder="+41 44 123 45 67"
              value={office.phone}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  offices: (settings.offices || []).map((o: Office) =>
                    o.id === office.id ? { ...o, phone: e.target.value } : o
                  ),
                })
              }
            />
          </div>
          <div className={styles.field}>
            <label><MapPin size={14} /> Address</label>
            <input
              placeholder="Street, City"
              value={office.address}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  offices: (settings.offices || []).map((o: Office) =>
                    o.id === office.id ? { ...o, address: e.target.value } : o
                  ),
                })
              }
            />
          </div>
          <div className={styles.field}>
            <label><Mail size={14} /> Email</label>
            <input
              placeholder="office@swisscars.md"
              value={office.email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  offices: (settings.offices || []).map((o: Office) =>
                    o.id === office.id ? { ...o, email: e.target.value } : o
                  ),
                })
              }
            />
          </div>
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label><Clock size={14} /> Working Hours</label>
            <input
              placeholder="Mon-Fri: 09:00-18:00"
              value={office.hours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  offices: (settings.offices || []).map((o: Office) =>
                    o.id === office.id ? { ...o, hours: e.target.value } : o
                  ),
                })
              }
            />
          </div>
        </div>
      </div>
    ))}
  </div>

  <button
    type="button"
    onClick={() =>
      setSettings({
        ...settings,
        offices: [
          ...(settings.offices || []),
          {
            id: crypto.randomUUID(),
            name: "",
            address: "",
            phone: "",
            email: "",
            hours: "",
          },
        ],
      })
    }
    style={{
      marginTop: "12px",
      padding: "8px 16px",
      background: "var(--color-primary)",
      color: "#fff",
      border: "none",
      borderRadius: "var(--radius-md)",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}
  >
    <MapPin size={14} /> + Add Office
  </button>
</section>
```

**Note:** `Mail` and `Clock` are already imported in this file. `Phone` and `MapPin` are also already imported. No new imports needed.

**Step 4: Run tests**

```bash
cd "/Users/ady/Documents/1 Websites/1 COD/In progress/swisscars md/swisscars-app"
npm test -- --run
```

Expected: 44 tests pass.

**Step 5: Commit**

```bash
git add app/admin/settings/SettingsForm.tsx
git commit -m "Feature: Add dynamic Office Locations section to admin settings"
```

---

## Task 2: Footer — Replace single office with offices loop

**Files:**
- Modify: `components/layout/Footer.tsx`

**Step 1: Read the file**

Open `components/layout/Footer.tsx` to confirm the exact lines for the contacts/contactGroup block.

**Step 2: Extract `offices` from settings**

After the existing destructuring at the top of the component (lines 17-20 where `phone`, `whatsapp`, `emailAddress`, `address` are extracted), add:

```ts
const offices: Array<{ id: string; name: string; address?: string; phone?: string; email?: string; hours?: string }> = settings.offices || [];
```

**Step 3: Replace the single office contactGroup**

Find the `<div className={styles.contactGroup}>` block that renders the single "Main Office" (the one with `address`, `emailAddress`, `phone`). Replace only that div (keep the WhatsApp/social contactGroup block below it unchanged):

```tsx
{offices.length > 0 ? (
    offices.map((office) => (
        <div key={office.id} className={styles.contactGroup}>
            <p className={styles.contactTitle}>{office.name}</p>
            {office.address && <p>{office.address}</p>}
            {office.email && (
                <p><a href={`mailto:${office.email}`}>{office.email}</a></p>
            )}
            {office.phone && (
                <p><a href={`tel:${office.phone}`}>{office.phone}</a></p>
            )}
            {office.hours && <p>{office.hours}</p>}
        </div>
    ))
) : (
    // Fallback to legacy global fields if no offices configured
    <div className={styles.contactGroup}>
        <p className={styles.contactTitle}>{t('main_office')}</p>
        {address ? <p>{address}</p> : <p style={{ color: '#dc2626' }}>⚠️ Adresa lipsește</p>}
        {emailAddress ? <p><a href={`mailto:${emailAddress}`}>{emailAddress}</a></p> : <p style={{ color: '#dc2626' }}>⚠️ Email lipsește</p>}
        {phone ? <p><a href={`tel:${phone}`}>{phone}</a></p> : <p style={{ color: '#dc2626' }}>⚠️ Telefon lipsește</p>}
    </div>
)}
```

**Step 4: Run tests**

```bash
npm test -- --run
```

Expected: 44 tests pass.

**Step 5: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "Feature: Footer now loops over offices array with fallback to legacy fields"
```

---

## Task 3: Contact page — Add offices section + i18n key

**Files:**
- Modify: `app/[locale]/contact/page.tsx`
- Modify: `components/contact/ContactPageClient.tsx`
- Modify: `messages/en.json`
- Modify: `messages/ro.json`
- Modify: `messages/ru.json`

### Step 1: Add i18n keys to all 3 message files

In `messages/en.json`, inside the `"contact_page"` object, add after `"quick_contact_text"`:
```json
"our_offices": "Our Offices"
```

In `messages/ro.json`, inside the `"contact_page"` object:
```json
"our_offices": "Sediile Noastre"
```

In `messages/ru.json`, inside the `"contact_page"` object:
```json
"our_offices": "Наши Офисы"
```

### Step 2: Pass `offices` from the contact page

Open `app/[locale]/contact/page.tsx`. Add `offices` to the props passed to `ContactPageClient`:

Change:
```tsx
return (
    <ContactPageClient
        phoneNumber={siteConfig.phone}
        whatsapp={siteConfig.whatsapp}
        emailAddress={siteConfig.email}
        address={siteConfig.address}
        workingHours={siteConfig.working_hours}
        workingDaysClosed={siteConfig.working_days_closed}
        googleMapsEmbed={siteConfig.google_maps_embed}
    />
);
```

To:
```tsx
return (
    <ContactPageClient
        phoneNumber={siteConfig.phone}
        whatsapp={siteConfig.whatsapp}
        emailAddress={siteConfig.email}
        address={siteConfig.address}
        workingHours={siteConfig.working_hours}
        workingDaysClosed={siteConfig.working_days_closed}
        googleMapsEmbed={siteConfig.google_maps_embed}
        offices={siteConfig.offices || []}
    />
);
```

### Step 3: Add `offices` prop and section to ContactPageClient

Open `components/contact/ContactPageClient.tsx`.

**Add the Office type** (before or after the `FormType` type):
```ts
type Office = {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
};
```

**Add `offices` to the Props type** (after `googleMapsEmbed?`):
```ts
offices?: Office[];
```

**Add `offices` to the destructured parameters** (after `googleMapsEmbed`):
```ts
export default function ContactPageClient({
    phoneNumber,
    whatsapp,
    emailAddress,
    address,
    workingHours,
    workingDaysClosed,
    googleMapsEmbed,
    offices = [],
}: Props) {
```

**Add the offices section** between the closing `</div>` of `mainGrid` and the Map section (i.e., after `</div>` that closes `<div className={styles.mainGrid}>`, before `{/* Map */}`):

```tsx
{/* Our Offices */}
{offices.length > 0 && (
    <div style={{ padding: '50px 0' }}>
        <h2 className="ui-title" style={{ marginBottom: '8px' }}>{t('our_offices')}</h2>
        <div className="ui-decor ui-decor--left" style={{ marginBottom: '32px' }} />
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
        }}>
            {offices.map((office) => (
                <div
                    key={office.id}
                    style={{
                        background: 'var(--color-gray)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px',
                        border: '1px solid var(--color-gray-2)',
                    }}
                >
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text)' }}>
                        {office.name}
                    </h3>
                    {office.address && (
                        <p style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <MapPin size={14} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            {office.address}
                        </p>
                    )}
                    {office.phone && (
                        <p style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Phone size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                            <a href={`tel:${office.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{office.phone}</a>
                        </p>
                    )}
                    {office.email && (
                        <p style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Mail size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                            <a href={`mailto:${office.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{office.email}</a>
                        </p>
                    )}
                    {office.hours && (
                        <p style={{ fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                            <Clock size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                            {office.hours}
                        </p>
                    )}
                </div>
            ))}
        </div>
    </div>
)}
```

**Note:** `MapPin`, `Phone`, `Mail`, `Clock` are already imported at line 4 of this file.

### Step 4: Run tests

```bash
npm test -- --run
```

Expected: 44 tests pass.

### Step 5: Commit

```bash
git add app/[locale]/contact/page.tsx components/contact/ContactPageClient.tsx messages/en.json messages/ro.json messages/ru.json
git commit -m "Feature: Add offices grid to contact page with i18n"
```

---

## Final verification

After all 3 tasks:

```bash
npm test -- --run
npm run build
```

Both must pass.

**Manual smoke test** (with `npm run dev`):
1. Go to `/admin/settings` → scroll to "Office Locations" → add 2 offices → Save
2. Check footer — should show both offices instead of the hardcoded single one
3. Go to `/contact` — should show the offices grid section
4. Go to `/en/contact` and `/ru/contact` — section title should be translated
5. Remove one office in admin → save → footer shows 1 office
6. Remove all offices → footer falls back to the legacy global address/phone/email fields
