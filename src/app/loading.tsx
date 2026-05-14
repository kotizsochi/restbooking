export default function Loading() {
  return (
    <div className="page-spinner">
      <div className="text-center">
        <div className="spinner" style={{ margin: "0 auto 16px" }} />
        <p className="text-muted text-base">Загрузка...</p>
      </div>
    </div>
  );
}
