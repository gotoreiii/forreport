import { useState } from "react";
import CampaignForm from "./CampaignForm";
import CampaignMetricsForm from "./CampaignMetricsForm";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

function App() {
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [metricsList, setMetricsList] = useState([]);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/users/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });

      if (!res.ok) throw new Error("Неверный логин или пароль");

      const data = await res.json();
      setToken(data.access_token);
      setUserRole(data.role);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUserRole("");
    setUsername("");
    setPassword("");
    setCampaigns([]);
    setSelectedCampaignId(null);
    setMetricsList([]);
  };

  const loadCampaigns = async () => {
    const res = await fetch("http://127.0.0.1:8000/campaigns", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setCampaigns(data);
  };

  const loadMetrics = async (campaignId) => {
    setSelectedCampaignId(campaignId);
    const res = await fetch(`http://127.0.0.1:8000/metrics/campaign/${campaignId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMetricsList(sorted);
    } else {
      setMetricsList([]);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Marketing Dashboard</h1>

      {!token ? (
        <>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br /><br />
          <button onClick={handleLogin}>Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <>
          <p>✅ Logged in as <b>{username}</b> ({userRole})</p>
          <button onClick={handleLogout}> Выйти</button>
          <br /><br />
          <button onClick={loadCampaigns}> Загрузить кампании</button>

          {(userRole === "admin" || userRole === "manager") && (
            <CampaignForm token={token} onCreated={loadCampaigns} />
          )}

          <ul>
            {campaigns.map((c) => (
              <li key={c.id}>
                <b>{c.name}</b> — {c.status} — $ {c.budget}
                <button style={{ marginLeft: 10 }} onClick={() => loadMetrics(c.id)}>
                  📊 Метрики
                </button>
              </li>
            ))}
          </ul>

          {selectedCampaignId && (
            <>
              <h3>Метрики кампании #{selectedCampaignId}</h3>
              {metricsList.length > 0 ? (
                <>
                  <ul>
                    {metricsList.map((m) => (
                      <li key={m.id}>
                        📅 {new Date(m.timestamp).toLocaleString()} — 👁 {m.impressions} — 🖱 {m.clicks} — 🛒 {m.conversions} —
                         CTR: {m["CTR (%)"]}% —  CR: {m["CR (%)"]}%
                      </li>
                    ))}
                  </ul>

                  <LineChart
                    width={600}
                    height={300}
                    data={metricsList}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
                    <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="conversions" stroke="#ffc658" />
                  </LineChart>
                </>
              ) : (
                <p>Нет метрик для этой кампании.</p>
              )}

              {(userRole === "admin" || userRole === "manager") && (
                <CampaignMetricsForm
                  campaignId={selectedCampaignId}
                  token={token}
                  onAdded={() => loadMetrics(selectedCampaignId)}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
