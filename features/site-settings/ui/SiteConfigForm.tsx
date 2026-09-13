"use client"

import { useState } from "react"
import { Save, Loader2 } from "lucide-react"
import { saveSettings } from "../actions"
import type { SiteConfig } from "@/lib/settings"
import SiteConfigGeneralSection from "./SiteConfigGeneralSection"
import SiteConfigLogoSection from "./SiteConfigLogoSection"
import SiteConfigContactSection from "./SiteConfigContactSection"
import SiteConfigSocialSection from "./SiteConfigSocialSection"
import SiteConfigTagManagerSection from "./SiteConfigTagManagerSection"
import SiteConfigNotificationsSection from "./SiteConfigNotificationsSection"
import styles from "./SiteConfigForm.module.css"

export default function SiteConfigForm({
  initialSettings,
}: {
  initialSettings: Partial<SiteConfig>
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
        <SiteConfigGeneralSection settings={settings} onSettingsChange={setSettings} />
        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />
        <SiteConfigLogoSection settings={settings} onSettingsChange={setSettings} />
        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />
        <SiteConfigContactSection settings={settings} onSettingsChange={setSettings} />
        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />
        <SiteConfigSocialSection settings={settings} onSettingsChange={setSettings} />
        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />
        <SiteConfigTagManagerSection settings={settings} onSettingsChange={setSettings} />
        <hr style={{ borderTop: "1px solid #eee", margin: 0 }} />
        <SiteConfigNotificationsSection />
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
