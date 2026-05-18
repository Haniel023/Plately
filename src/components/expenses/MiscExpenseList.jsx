import { Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/recipeHelpers";
import EmptyState from "../common/EmptyState";

function MiscExpenseList({ expenses, onDelete }) {
  if (!expenses || expenses.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="No misc expenses"
        message="Add extra costs not covered by your meal plan."
      />
    );
  }

  return (
    <div className="misc-expense-list">
      {expenses.map((exp) => (
        <div key={exp.id} className="misc-expense-item">
          <span className="misc-expense-label">{exp.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="misc-expense-amount">{formatCurrency(exp.amount)}</span>
            <button
              className="delete-btn"
              onClick={() => onDelete(exp.id)}
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MiscExpenseList;
