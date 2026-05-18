import { Trash2 } from "lucide-react";

function StepRow({ step, index, onChange, onRemove }) {
  const handleInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className="step-form-row">
      <div className="step-form-number">{index + 1}</div>
      <textarea
        placeholder={`Step ${index + 1}…`}
        value={step.instruction}
        rows={1}
        onInput={handleInput}
        onChange={(e) => {
          onChange(index, { ...step, instruction: e.target.value });
        }}
      />
      <button
        type="button"
        className="delete-btn"
        onClick={() => onRemove(index)}
        title="Remove step"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default StepRow;
