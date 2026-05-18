import { Trash2 } from "lucide-react";
import { UNITS } from "../../lib/constants";

function IngredientRow({ ingredient, index, onChange, onRemove }) {
  const handleField = (field, value) => {
    onChange(index, { ...ingredient, [field]: value });
  };

  return (
    <div className="ingredient-form-row">
      <input
        type="text"
        className="ingr-name"
        placeholder="Ingredient name"
        value={ingredient.name}
        onChange={(e) => handleField("name", e.target.value)}
      />
      <input
        type="number"
        className="ingr-qty"
        placeholder="Qty"
        value={ingredient.quantity}
        onChange={(e) => handleField("quantity", e.target.value)}
        min="0"
        step="any"
      />
      <select
        className="ingr-unit"
        value={ingredient.unit}
        onChange={(e) => handleField("unit", e.target.value)}
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <input
        type="number"
        className="ingr-price"
        placeholder="₱ total"
        value={ingredient.price_per_unit}
        onChange={(e) => handleField("price_per_unit", e.target.value)}
        min="0"
        step="any"
      />
      <button
        type="button"
        className="delete-btn"
        onClick={() => onRemove(index)}
        title="Remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default IngredientRow;
