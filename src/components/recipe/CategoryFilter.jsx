import { CATEGORIES } from "../../lib/constants";

function CategoryFilter({ activeCategory, onSelect }) {
  return (
    <div className="space-pills">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`space-pill${activeCategory === cat ? " active" : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
