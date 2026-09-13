import { Tag, CheckCircle, AlertTriangle } from "lucide-react"
import type { SiteConfig } from "../site-settings.types"
import styles from "./SiteConfigForm.module.css"

interface SiteConfigSectionProps {
  settings: Partial<SiteConfig>
  onSettingsChange: (settings: Partial<SiteConfig>) => void
}

export default function SiteConfigTagManagerSection({ settings, onSettingsChange }: SiteConfigSectionProps) {
  return (
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
                onSettingsChange({ ...settings, gtm_id: e.target.value })
              }
              style={{
                paddingRight: settings.gtm_id ? "110px" : undefined,
              }}
            />
            {settings.gtm_id && (
              <button
                type="button"
                onClick={() => onSettingsChange({ ...settings, gtm_id: "" })}
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
  )
}
