import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roomApi } from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");

  const loadRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await roomApi.list();
      setRooms(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const { data } = await roomApi.create({
        name: newName.trim() || "Untitled Room",
      });
      const room = data.data;
      setNewName("");
      navigate(`/editor/${room.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete “${name}”?`)) return;
    try {
      await roomApi.remove(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete room");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="auth-brand">
          <span className="brand-mark">RV</span>
          <div>
            <strong>RoomVision</strong>
            <small>Welcome{user?.name ? `, ${user.name}` : ""}</small>
          </div>
        </div>
        <button type="button" className="ghost-btn" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-create">
          <h1>Your rooms</h1>
          <p>Open a room in the editor or create a new one.</p>
          <form className="create-row" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="New room name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={80}
            />
            <button type="submit" className="auth-submit" disabled={creating}>
              {creating ? "Creating…" : "Create new room"}
            </button>
          </form>
        </section>

        {error && <p className="auth-error dashboard-error">{error}</p>}

        {loading ? (
          <p className="dashboard-empty">Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <p className="dashboard-empty">
            No rooms yet. Create your first room above.
          </p>
        ) : (
          <div className="room-grid">
            {rooms.map((room) => (
              <article key={room.id} className="room-card">
                <Link to={`/editor/${room.id}`} className="room-thumb-link">
                  {room.thumbnail ? (
                    <img
                      className="room-thumb"
                      src={room.thumbnail}
                      alt=""
                    />
                  ) : (
                    <div className="room-thumb placeholder">No preview</div>
                  )}
                </Link>
                <div className="room-card-body">
                  <h2>{room.name}</h2>
                  <p>Updated {formatDate(room.updatedAt)}</p>
                </div>
                <div className="room-card-actions">
                  <Link className="auth-submit" to={`/editor/${room.id}`}>
                    Open editor
                  </Link>
                  <button
                    type="button"
                    className="ghost-btn danger"
                    onClick={() => handleDelete(room.id, room.name)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
