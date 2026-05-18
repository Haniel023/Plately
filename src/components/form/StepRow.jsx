import { Trash2 } from "lucide-react";

function StepRow({ step, index, onChange, onRemove }) {
  return (
    <div className="step-form-row">
      <div className="step-form-number">{index + 1}</div>
      <textarea
        placeholder={`Step ${index + 1} instructions...`}
        value={step.instruction}
        onChange={(e) => onChange(index, { ...step, instruction: e.target.value })}
      />
      <button
        type="button"
        className="delete-btn"
        onClick={() => onRemove(index)}
        title="Remove step"
        style={{ marginTop: 10 }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default StepRow;
