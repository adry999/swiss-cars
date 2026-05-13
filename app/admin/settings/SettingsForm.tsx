"use client"

import { useState } from "react"
import {
  Save,
  Loader2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Settings as SettingsIcon,
  Facebook,
  Instagram,
  Hash,
  Tag,
  CheckCircle,
  AlertTriangle,
  Bell,
  Send,
  Image as ImageIcon,
  Clock,
  Map,
} from "lucide-react"
import { saveSettings } from "@/lib/actions/settings"
import ImageUploader from "@/components/admin/ImageUploader"
import styles from "./page.module.css"

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: any
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState(initialSettings)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await saveSettings("site_config", settings)
      if (res.success) {
        alert("Setările au fost salvate cu succes!")
      } else {
        alert("Eroare la salvarea setărilor.")
      }
    } catch (e) {
      alert("Eroare la salvarea setărilor.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Global Site Configuration</h1>

      <form onSubmit={handleSave} className={styles.form}>
        {/* General Settings */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <SettingsIcon size={16} /> General Settings
          </h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Site Title</label>
              <input
                value={settings.site_title || ""}
                onChange={(e) =>
                  setSettings({ ...settings, site_title: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label>Max Car Images Allowed</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.max_car_images || 25}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    max_car_images: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingsIcon size={14} /> Global Header Height: <strong>{settings.header_height || 80}px</strong>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>60px</span>
                <input
                  type="range"
                  min="60"
                  max="300"
                  step="5"
                  value={settings.header_height || 80}
                  onChange={(e) => setSettings({ ...settings, header_height: parseInt(e.target.value) })}
                  style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(((settings.header_height || 80) - 60) / (300 - 60)) * 100}%, #e5e7eb ${(((settings.header_height || 80) - 60) / (300 - 60)) * 100}%, #e5e7eb 100%)`,
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#666' }}>300px</span>
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Această valoare ajustează automat spațiul de sub header pe toate paginile pentru a evita suprapunerea conținutului sau spațiile prea mari.
              </p>
            </div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label>SEO Site Description (Meta)</label>
              <textarea
                rows={3}
                value={settings.site_description || ""}
                onChange={(e) =>
                  setSettings({ ...settings, site_description: e.target.value })
                }
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-gray-2)",
                  background: "var(--color-gray)",
                  fontSize: "14px",
                  width: "100%",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        </section>

        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />

        {/* Logo Settings */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <ImageIcon size={16} /> Site Logo
          </h2>
          <div className={styles.grid}>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label>
                Logo URL actual: {settings.logo_url || "default (din fișier)"}
              </label>
              <ImageUploader
                value={settings.logo_url ? [settings.logo_url] : []}
                onChange={(urls) =>
                  setSettings({ ...settings, logo_url: urls[0] || "" })
                }
                maxFiles={1}
              />
              {settings.logo_url && (
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <img
                    src={settings.logo_url}
                    alt="Logo preview"
                    style={{ height: "50px", objectFit: "contain" }}
                  />
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logo_url: "" })}
                    style={{
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
                    Resetează Logo
                  </button>
                </div>
              )}
            </div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <ImageIcon size={14} /> Mărimea Logo-ului:{" "}
                <strong>{settings.logo_height || 80}px</strong>
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#666" }}>40px</span>
                <input
                  type="range"
                  min="40"
                  max="400"
                  step="5"
                  value={settings.logo_height || 80}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      logo_height: parseInt(e.target.value),
                    })
                  }
                  style={{
                    flex: 1,
                    height: "8px",
                    borderRadius: "4px",
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(((settings.logo_height || 80) - 40) / (400 - 40)) * 100}%, #e5e7eb ${(((settings.logo_height || 80) - 40) / (400 - 40)) * 100}%, #e5e7eb 100%)`,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#666" }}>400px</span>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  padding: "20px",
                  background: "#1a1a2e",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={
                    settings.logo_url || "/media/general/swiss-logo-2-red.png"
                  }
                  alt="Logo preview"
                  style={{
                    height: `${settings.logo_height || 80}px`,
                    objectFit: "contain",
                  }}
                />
              </div>
              <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                Previzualizare logo-ului pe fundal închis (ca în header)
              </p>
            </div>
          </div>
        </section>

        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />

        {/* Contact Settings */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <Phone size={16} /> Contact Information
          </h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>
                <Phone size={14} /> Phone Number
              </label>
              <input
                value={settings.phone || ""}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label>
                <MessageCircle size={14} /> WhatsApp Number
              </label>
              <input
                value={settings.whatsapp || ""}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label>
                <Mail size={14} /> Email Address
              </label>
              <input
                value={settings.email || ""}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label>
                <MapPin size={14} /> Office Address
              </label>
              <textarea
                rows={3}
                value={settings.address || ""}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-gray-2)",
                  background: "var(--color-gray)",
                  fontSize: "14px",
                  width: "100%",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label>
                <Phone size={14} /> Additional Phone Numbers (Footer Only)
              </label>
              <input
                placeholder="022 123 456, 069 999 888"
                value={settings.footer_phones || ""}
                onChange={(e) =>
                  setSettings({ ...settings, footer_phones: e.target.value })
                }
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                Poți adăuga mai multe numere separate prin virgulă. Acestea vor apărea doar în subsolul paginii (footer), sub numărul principal.
              </p>
            </div>
            <div className={styles.field}>
              <label>
                <Clock size={14} /> Working Hours
              </label>
              <input
                placeholder="Luni - Vineri: 09:00 - 18:00"
                value={settings.working_hours || ""}
                onChange={(e) =>
                  setSettings({ ...settings, working_hours: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label>
                <Clock size={14} /> Days Closed
              </label>
              <input
                placeholder="Sâmbătă, Duminică: Închis"
                value={settings.working_days_closed || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    working_days_closed: e.target.value,
                  })
                }
              />
            </div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label>
                <Map size={14} /> Google Maps Embed URL
              </label>
              <input
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={settings.google_maps_embed || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    google_maps_embed: e.target.value,
                  })
                }
              />
              <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                Copiază URL-ul din Google Maps → Share → Embed a map → Copiază
                doar partea src="..."
              </p>
            </div>
          </div>
        </section>

        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />

        {/* Social Settings */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <Hash size={16} /> Social Media Links
          </h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>
                <Facebook size={14} /> Facebook URL
              </label>
              <input
                placeholder="https://facebook.com/..."
                value={settings.facebook || ""}
                onChange={(e) =>
                  setSettings({ ...settings, facebook: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label>
                <Instagram size={14} /> Instagram URL
              </label>
              <input
                placeholder="https://instagram.com/..."
                value={settings.instagram || ""}
                onChange={(e) =>
                  setSettings({ ...settings, instagram: e.target.value })
                }
              />
            </div>
          </div>
        </section>

        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />

        {/* GTM Settings */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <Tag size={16} /> Google Tag Manager
          </h2>
          <div className={styles.grid}>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label>
                <Tag size={14} /> GTM Container ID
              </label>
              <div style={{ position: "relative" }}>
                <input
                  placeholder="GTM-XXXXXXX"
                  value={settings.gtm_id || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, gtm_id: e.target.value })
                  }
                  style={{
                    paddingRight: settings.gtm_id ? "110px" : undefined,
                  }}
                />
                {settings.gtm_id && (
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, gtm_id: "" })}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
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
                    Elimină GTM
                  </button>
                )}
              </div>
              {settings.gtm_id && !settings.gtm_id.startsWith("GTM-") && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "4px",
                  }}
                >
                  <AlertTriangle size={13} /> ID-ul GTM trebuie să înceapă cu
                  «GTM-» (ex: GTM-XXXXXXX)
                </p>
              )}
              {settings.gtm_id && settings.gtm_id.startsWith("GTM-") && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "4px",
                  }}
                >
                  <CheckCircle size={13} /> GTM activ — containerul va fi
                  injectat pe site
                </p>
              )}
              {!settings.gtm_id && (
                <p
                  style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}
                >
                  Lasă gol dacă nu folosești GTM. Găsești ID-ul în Google Tag
                  Manager → Admin → Container Settings.
                </p>
              )}
            </div>
          </div>
        </section>

        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />

        {/* Notification Settings */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <Bell size={16} /> Lead Notifications
          </h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>
                <Send size={14} /> Telegram Bot Token
              </label>
              <input
                placeholder="123456789:ABCDefGh..."
                value={settings.telegram_bot_token || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    telegram_bot_token: e.target.value,
                  })
                }
              />
            </div>
            <div className={styles.field}>
              <label>
                <Hash size={14} /> Telegram Chat ID
              </label>
              <input
                placeholder="-100123456789"
                value={settings.telegram_chat_id || ""}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_chat_id: e.target.value })
                }
              />
            </div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label>
                <Mail size={14} /> Notification Email (Resend)
              </label>
              <input
                placeholder="admin@example.com"
                type="email"
                value={settings.notification_email || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_email: e.target.value,
                  })
                }
              />
              <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                Vei primi un email la fiecare lead nou. Necesită configurare
                Resend API Key în .env.
              </p>
            </div>
          </div>
        </section>

        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />

        <div className={styles.footer}>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className={styles.spinner} />
            ) : (
              <Save size={18} className="me-2" />
            )}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  )
}
