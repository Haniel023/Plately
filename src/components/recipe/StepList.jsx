function StepList({ steps }) {
  if (!steps || steps.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No steps listed.</p>;
  }

  const sorted = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <div className="step-list">
      {sorted.map((step) => (
        <div key={step.id} className="step-item">
          <div className="step-number">{step.step_number}</div>
          <p className="step-text">{step.instruction}</p>
        </div>
      ))}
    </div>
  );
}

export default StepList;
