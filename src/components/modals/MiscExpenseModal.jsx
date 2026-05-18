function MiscExpenseModal({ show, form, setForm, onSubmit, onClose, loading }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Add Misc Expense</h2>

        <label style={{ display: "block", fontWeight: 700, marginBottom: 4, marginTop: 12 }}>
          Label
        </label>
        <input
          className="form-input"
          placeholder="e.g. Cooking oil, plastic bags..."
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />

        <label style={{ display: "block", fontWeight: 700, marginBottom: 4, marginTop: 14 }}>
          Amount (₱)
        </label>
        <input
          className="form-input"
          type="number"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          min="0"
          step="any"
        />

        <div className="modal-actions">
          <button
            className="modal-submit-btn"
            onClick={onSubmit}
            disabled={loading || !form.label.trim() || !form.amount}
          >
            {loading ? "Adding..." : "Add Expense"}
          </button>
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiscExpenseModal;
