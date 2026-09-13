import { Phone, Mail, MapPin, MessageCircle, Clock, Map } from "lucide-react"
import type { SiteConfig } from "@/lib/settings"
import styles from "./SiteConfigForm.module.css"

interface SiteConfigSectionProps {
  settings: Partial<SiteConfig>
  onSettingsChange: (settings: Partial<SiteConfig>) => void
}

export default function SiteConfigContactSection({ settings, onSettingsChange }: SiteConfigSectionProps) {
  return (
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
              onSettingsChange({ ...settings, phone: e.target.value })
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
              onSettingsChange({ ...settings, whatsapp: e.target.value })
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
              onSettingsChange({ ...settings, email: e.target.value })
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
              onSettingsChange({ ...settings, address: e.target.value })
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
              onSettingsChange({ ...settings, footer_phones: e.target.value })
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
              onSettingsChange({ ...settings, working_hours: e.target.value })
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
              onSettingsChange({
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
              onSettingsChange({
                ...settings,
                google_maps_embed: e.target.value,
              })
            }
          />
          <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            Copiază URL-ul din Google Maps → Share → Embed a map → Copiază
            doar partea src=&quot;...&quot;
          </p>
        </div>
      </div>
    </section>
  )
}
