# Restore Public Layout

When the client pays, replace the blank body in `app/[locale]/layout.tsx` with the full layout.

**Find this:**
```tsx
return (
    <html lang={locale} suppressHydrationWarning>
        <body suppressHydrationWarning />
    </html>
);
```

**Replace with:**
```tsx
return (
    <html lang={locale} suppressHydrationWarning>
        <body
            suppressHydrationWarning
            style={{ '--header-height': `${(settings as any)?.header_height || 80}px` } as React.CSSProperties}
        >
            <NextIntlClientProvider locale={locale} messages={messages}>
                <ToastProvider>
                    <GTMScript gtmId={gtmId} />
                    <GoogleAnalytics />
                    <Preloader />
                    <GTMNoscript gtmId={gtmId} />
                    <Header logoUrl={(settings as any)?.logo_url || ''} logoHeight={(settings as any)?.logo_height || 80} phone={(settings as any)?.phone} />
                    {children}
                    <Footer settings={settings} />
                    <WhatsAppFloat phone={(settings as any)?.whatsapp} />
                </ToastProvider>
            </NextIntlClientProvider>
        </body>
    </html>
);
```

Then redeploy.
