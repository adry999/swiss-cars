import { Settings as SettingsIcon } from "lucide-react"
import type { SiteConfig } from "../site-settings.types"
import styles from "./SiteConfigForm.module.css"

interface SiteConfigSectionProps {
  settings: Partial<SiteConfig>
  onSettingsChange: (settings: Partial<SiteConfig>) => void
}

export default function SiteConfigGeneralSection({ settings, onSettingsChange }: SiteConfigSectionProps) {
  return (
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
              onSettingsChange({ ...settings, site_title: e.target.value })
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
              onSettingsChange({
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
              onChange={(e) => onSettingsChange({ ...settings, header_height: parseInt(e.target.value) })}
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
              onSettingsChange({ ...settings, site_description: e.target.value })
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
  )
}
