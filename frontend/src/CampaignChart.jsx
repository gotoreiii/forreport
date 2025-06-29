import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CampaignChart({ data }) {
  if (!data || data.length === 0) return <p>Данных для графика нет.</p>;

  const formatted = data.map((m) => ({
    ...m,
    timestamp: new Date(m.timestamp).toLocaleDateString("ru-RU"),
  }));

  return (
    <div style={{ height: 300 }}>
      <h3>График метрик</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="impressions" stroke="#8884d8" name="Показы" />
          <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="Клики" />
          <Line type="monotone" dataKey="conversions" stroke="#ff7300" name="Конверсии" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CampaignChart;
