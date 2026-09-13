import { Image as ImageIcon } from "lucide-react"
import ImageUploader from "@/components/admin/ImageUploader"
import type { SiteConfig } from "@/lib/settings"
import styles from "./SiteConfigForm.module.css"

interface SiteConfigSectionProps {
  settings: Partial<SiteConfig>
  onSettingsChange: (settings: Partial<SiteConfig>) => void
}

export default function SiteConfigLogoSection({ settings, onSettingsChange }: SiteConfigSectionProps) {
  return (
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
              onSettingsChange({ ...settings, logo_url: urls[0] || "" })
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
                onClick={() => onSettingsChange({ ...settings, logo_url: "" })}
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
                onSettingsChange({
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
  )
}
