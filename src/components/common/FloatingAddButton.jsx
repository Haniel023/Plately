import { Plus } from "lucide-react";

function FloatingAddButton({ label = "Add", onClick }) {
  return (
    <button className="floating-add" onClick={onClick}>
      <Plus size={20} />
      <span>{label}</span>
    </button>
  );
}

export default FloatingAddButton;
