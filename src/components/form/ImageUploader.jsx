import { ImagePlus } from "lucide-react";

function ImageUploader({ previewUrl, onChange }) {
  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="Cover preview" />
      ) : (
        <>
          <ImagePlus size={32} style={{ color: "var(--text-muted)" }} />
          <span className="image-uploader-label">
            Click to upload cover photo
          </span>
        </>
      )}
    </div>
  );
}

export default ImageUploader;
