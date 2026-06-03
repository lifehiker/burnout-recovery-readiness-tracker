import { useEffect } from "react"
import { useRouter } from "next/router"

export default function CheckinAlias() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/checkin")
  }, [router])
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#475569", marginBottom: "1rem" }}>Loading check-in&hellip;</p>
        <a href="/checkin" style={{ display: "inline-block", padding: "0.5rem 1.5rem", background: "#1e6d67", color: "white", borderRadius: "0.75rem", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
          Go to Check-In
        </a>
      </div>
    </div>
  )
}
