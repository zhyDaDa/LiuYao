export function LookupCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="lookup-card">
      <h2>{title}</h2>
      {rows.map((row) => (
        <p key={row}>{row}</p>
      ))}
    </div>
  );
}
