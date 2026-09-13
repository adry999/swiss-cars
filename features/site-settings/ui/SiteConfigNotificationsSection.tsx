import { AlertTriangle, Send, Mail, Bell } from "lucide-react"
import styles from "./SiteConfigForm.module.css"

export default function SiteConfigNotificationsSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.subtitle}>
        <Bell size={16} /> Lead Notifications
      </h2>
      {/* These used to be editable here and were stored inside the
          `site_config` row, which is readable by anyone holding the public
          anon key — and was also serialized into every public page's HTML.
          They now live in server-side environment variables only. */}
      <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#555" }}>
          <AlertTriangle size={14} style={{ verticalAlign: "-2px" }} />{" "}
          Credențialele de notificare se configurează acum din variabilele
          de mediu ale serverului, nu din această pagină:
        </p>
        <pre
          style={{
            fontSize: "12px",
            background: "#f6f7f9",
            border: "1px solid #e6e8eb",
            borderRadius: "6px",
            padding: "12px",
            marginTop: "8px",
            overflowX: "auto",
          }}
        >
          {`TELEGRAM_BOT_TOKEN=...\nTELEGRAM_CHAT_ID=...\nNOTIFICATION_EMAIL=...\nRESEND_API_KEY=...`}
        </pre>
        <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
          <Send size={12} style={{ verticalAlign: "-1px" }} /> Telegram și{" "}
          <Mail size={12} style={{ verticalAlign: "-1px" }} /> email pentru
          fiecare lead nou. Vezi database/2026-08-26_security_hardening.sql.
        </p>
      </div>
    </section>
  )
}
