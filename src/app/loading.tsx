export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Загрузка...</p>
      </div>
    </div>
  );
}
