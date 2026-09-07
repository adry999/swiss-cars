# Analytics Setup Guide

**Platform**: Google Analytics 4 (GA4) + Google Tag Manager (GTM)  
**Status**: ✓ Configured and ready to use  
**Setup**: ~15 min (env var only)

---

## Quick Start

### 1. Create GA4 Property
```
1. Go to Google Analytics > Admin
2. Select "Create Property"
3. Property name: "SwissCars.md"
4. Timezone: UTC or user timezone
5. Currency: EUR
6. Get Measurement ID: G-XXXXXXXXXX
```

### 2. Set Environment Variable
```bash
# .env.local or deployment environment
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Verify Tracking
- Deploy or `npm run dev`
- Open browser DevTools Console
- Check: `window.dataLayer` should exist
- Visit any page and check GA4 real-time report (Admin > Real-time)

---

## Tracked Events

### Automatic (GA4 Default)
- ✓ Page views
- ✓ Session start
- ✓ User engagement (session duration, scroll)
- ✓ Core Web Vitals (LCP, FID, CLS)

### Manual Events (To Implement)

**Lead Submission** (highest priority)
```ts
// File: lib/utils/analytics.ts
export function trackLeadSubmit(carName: string, source: 'homepage' | 'inventory' | 'detail') {
  if (!window.gtag) return;
  window.gtag('event', 'lead_submission', {
    car_name: carName,
    source,
    value: 1,
  });
}
```

**Car Interest**
```ts
export function trackCarView(carId: string, carName: string) {
  window.gtag?.('event', 'view_item', {
    items: [{
      item_id: carId,
      item_name: carName,
      item_category: 'Vehicle',
    }],
  });
}
```

**Search/Filter**
```ts
export function trackSearch(filterType: string, filterValue: string) {
  window.gtag?.('event', 'search', {
    search_term: `${filterType}:${filterValue}`,
  });
}
```

**Newsletter Signup**
```ts
export function trackSubscribe() {
  window.gtag?.('event', 'sign_up', {
    method: 'newsletter',
  });
}
```

---

## Dashboard Setup

### Recommended Dashboard
**File**: `ANALYTICS_DASHBOARD_CONFIG.json`

**Key Metrics**:
1. **Acquisitions**
   - Sessions (last 30 days)
   - New users
   - Traffic source breakdown

2. **Engagement**
   - Page views (inventory, detail, contact)
   - Average session duration
   - Bounce rate

3. **Conversions** (depends on tracking implementation)
   - Lead submissions (form submissions)
   - Car details viewed
   - Newsletter signups

4. **Tech**
   - Core Web Vitals
   - Devices/Browsers
   - Geographic breakdown

---

## Google Tag Manager (Optional)

GTM is already integrated but not required. Use it if you want to:
- Manage tracking tags without code changes
- A/B test tracking changes
- Sync with third-party tools (Slack, CRM)

### Setup GTM (if using)
```
1. Create GTM account
2. Create container: "swisscars.md"
3. Get Container ID: GTM-XXXXXXXXX
4. Set in site_settings.gtm_id (or env var)
5. Deploy
```

---

## Recommended Events to Track

### High Value (Implement First)
1. **Lead Submission** — form submit on any page
2. **Car View** — clicked car detail page
3. **Section Scroll** — reached reviews, partners, etc.

### Medium Value (Nice to Have)
4. **Filter Applied** — used inventory filters
5. **Newsletter Signup** — subscription form
6. **WhatsApp Click** — clicked WhatsApp button

### Low Value (Skip for Now)
7. **Page scroll depth** — GA4 tracks by default
8. **Video watch** — no videos on site
9. **Outbound links** — not critical

---

## Conversion Funnel (Recommendation)

Track this flow to understand conversion rates:

```
1. Session Start
    ↓ (acquisition source)
2. Homepage Visit
    ↓ (did they scroll?)
3. Inventory/Car View
    ↓ (which car?)
4. Car Detail Page
    ↓ (did they call/message?)
5. Lead Submission / Contact
```

**Dashboard Column**: "Conversion Rate" = (Lead Submissions / Sessions) × 100

---

## Privacy & GDPR

### Data Collection
- ✓ GA4 anonymizes IP by default
- ✓ No personal data collected (no email, phone stored in GA)
- ✓ Session ID is generated locally, not linked to user ID
- ⚠ Cookie consent may be required depending on jurisdiction

### Cookie Banner
**Status**: Not implemented  
**Recommendation**: Add if targeting EU users  
**Implementation**: Use `next-intl` to show banner per locale  
**Duration**: 30 min (simple implementation)

### Data Retention
- Default: 14 months
- Can be configured in GA4 Admin > Data Settings

---

## Debugging

### Check if GA4 is loaded
```js
// In browser console
console.log(window.gtag);  // Should be a function
console.log(window.dataLayer);  // Should be an array
```

### Send test event
```js
window.gtag('event', 'test_event', { test: true });
```

### View in GA4 Real-time
1. GA4 Admin > Reports > Real-time
2. Perform action on site
3. Event should appear within 1-2 seconds

### Common Issues
| Issue | Solution |
|-------|----------|
| GA4 not loading | Check env var name: `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Events not firing | Measurement ID format should be `G-*` |
| Only seeing default events | Implement custom event tracking |
| No data in real-time | Check Network tab for gtag.js (should not be blocked) |

---

## Next Steps

1. **Week 1**: Set GA_MEASUREMENT_ID env var, verify data flows
2. **Week 2**: Implement lead submission tracking
3. **Week 3**: Add car view tracking, monitor conversion rate
4. **Week 4**: Optimize based on data (which sources convert best?)

---

## Resources

- [GA4 Setup Guide](https://support.google.com/analytics/answer/10089681)
- [GA4 Events](https://support.google.com/analytics/answer/10085313)
- [Core Web Vitals in GA4](https://support.google.com/analytics/answer/9216061)
- [GTM Setup](https://support.google.com/tagmanager/answer/6103696)

---

## Component Integration

**Current Status**: GA4 loaded on every page  
**Location**: `app/[locale]/layout.tsx` (imported GoogleAnalytics, GTMScript)  
**Configuration**: Environment variables only (no hardcoded IDs)

---

**Last Updated**: 2026-09-07  
**Status**: Ready to use ✓
