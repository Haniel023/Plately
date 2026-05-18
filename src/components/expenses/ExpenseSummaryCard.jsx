import { formatCurrency } from "../../lib/recipeHelpers";

function ExpenseSummaryCard({ plannedCost, miscTotal }) {
  const total = plannedCost + miscTotal;

  return (
    <div className="expense-summary-card">
      <div className="expense-summary-row">
        <span className="expense-summary-label">🛒 Planned Groceries</span>
        <strong>{formatCurrency(plannedCost)}</strong>
      </div>
      <div className="expense-summary-row">
        <span className="expense-summary-label">📝 Misc Expenses</span>
        <strong>{formatCurrency(miscTotal)}</strong>
      </div>
      <div className="expense-summary-row">
        <span className="expense-summary-label">Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </div>
  );
}

export default ExpenseSummaryCard;
