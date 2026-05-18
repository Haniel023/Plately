import { useState } from "react";

function StarRating({ value = 0, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? Math.round(value);
  const interactive = !!onChange;

  return (
    <div className={`star-rating${interactive ? " star-rating--interactive" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn${star <= display ? " filled" : ""}`}
          style={{ fontSize: size }}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(null)}
          onClick={() => interactive && onChange(star)}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;
