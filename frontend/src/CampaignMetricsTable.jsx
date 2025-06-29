import { useEffect, useState } from "react";

function CampaignMetricsTable({ campaignId, token }) {
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/metrics/campaign/${campaignId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Не удалось загрузить метрики");
        const data = await res.json();
        setMetrics(data);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    };

    load();
  }, [campaignId, token]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!metrics.length) return <p>Нет метрик</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>📊 Метрики кампании</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Impressions</th>
            <th>Clicks</th>
            <th>Conversions</th>
            <th>CTR (%)</th>
            <th>CR (%)</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.timestamp).toLocaleString()}</td>
              <td>{m.impressions}</td>
              <td>{m.clicks}</td>
              <td>{m.conversions}</td>
              <td>{m["CTR (%)"]}</td>
              <td>{m["CR (%)"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CampaignMetricsTable;
