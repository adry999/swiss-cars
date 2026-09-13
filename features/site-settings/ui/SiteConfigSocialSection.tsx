import { Hash, Facebook, Instagram } from "lucide-react"
import type { SiteConfig } from "@/lib/settings"
import styles from "./SiteConfigForm.module.css"

interface SiteConfigSectionProps {
  settings: Partial<SiteConfig>
  onSettingsChange: (settings: Partial<SiteConfig>) => void
}

export default function SiteConfigSocialSection({ settings, onSettingsChange }: SiteConfigSectionProps) {
  return (
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
              onSettingsChange({ ...settings, facebook: e.target.value })
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
              onSettingsChange({ ...settings, instagram: e.target.value })
            }
          />
        </div>
      </div>
    </section>
  )
}
