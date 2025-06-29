import { useState, useEffect } from "react";

function CampaignForm({ token, onCreated }) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("active");
  const [budget, setBudget] = useState("");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const res = await fetch("http://127.0.0.1:8000/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setClients(data);
    };
    fetchClients();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/campaigns/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        client_id: parseInt(clientId),
        status,
        budget: parseFloat(budget),
      }),
    });

    if (res.ok) {
      setName("");
      setClientId("");
      setStatus("active");
      setBudget("");
      onCreated();
    } else {
      alert("Ошибка при создании кампании");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h3>Создать кампанию</h3>
      <input
        type="text"
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br /><br />

      <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
        <option value="">Выберите клиента</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select><br /><br />

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="active">active</option>
        <option value="paused">paused</option>
      </select><br /><br />

      <input
        type="number"
        placeholder="Бюджет"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      /><br /><br />

      <button type="submit">Создать</button>
    </form>
  );
}

export default CampaignForm;
