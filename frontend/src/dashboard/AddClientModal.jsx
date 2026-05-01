import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { addClient } from "./clientsStore";

export default function AddClientModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", age: "", condition: "", notes: "" });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;
    const created = addClient(form);
    onAdded?.(created);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(3,17,25,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420, background: "rgba(10,28,46,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, padding: "26px 28px 22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F7F7F7" }}>Add Client</div>
            <div style={{ fontSize: 12, color: "rgba(247,247,247,0.4)", marginTop: 2 }}>
              Create a new VI client profile.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(247,247,247,0.5)" }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Name *">
            <input
              required value={form.name} onChange={update("name")}
              placeholder="Jane Doe" style={inputStyle}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
            <Field label="Age">
              <input
                type="number" min="0" max="120"
                value={form.age} onChange={update("age")}
                placeholder="—" style={inputStyle}
              />
            </Field>
            <Field label="Condition">
              <input
                value={form.condition} onChange={update("condition")}
                placeholder="e.g. Macular Degeneration" style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes} onChange={update("notes")}
              placeholder="Optional notes about preferences, experience, etc."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter, sans-serif" }}
            />
          </Field>

          <button
            type="submit"
            disabled={!form.name}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8,
              background: form.name ? "#01B4AF" : "rgba(1,180,175,0.4)",
              border: "none",
              color: "#031119", fontWeight: 600, fontSize: 13,
              cursor: form.name ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 4,
            }}
          >
            <UserPlus size={14} /> Add Client
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: "#F7F7F7", fontSize: 13,
  outline: "none", boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, color: "rgba(247,247,247,0.45)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
