import { useState } from "react";

function CampaignMetricsForm({ campaignId, token, onAdded }) {
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [conversions, setConversions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/metrics/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        impressions: parseInt(impressions),
        clicks: parseInt(clicks),
        conversions: parseInt(conversions),
      }),
    });

    if (res.ok) {
      setImpressions("");
      setClicks("");
      setConversions("");
      onAdded();
    } else {
      alert("Ошибка при добавлении метрик");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h4>Добавить метрики к кампании #{campaignId}</h4>
      <input
        type="number"
        placeholder="Impressions"
        value={impressions}
        onChange={(e) => setImpressions(e.target.value)}
      /><br /><br />
      <input
        type="number"
        placeholder="Clicks"
        value={clicks}
        onChange={(e) => setClicks(e.target.value)}
      /><br /><br />
      <input
        type="number"
        placeholder="Conversions"
        value={conversions}
        onChange={(e) => setConversions(e.target.value)}
      /><br /><br />
      <button type="submit">Добавить метрики</button>
    </form>
  );
}

export default CampaignMetricsForm;
