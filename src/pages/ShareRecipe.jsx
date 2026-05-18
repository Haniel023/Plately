import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { newIngredient, newStep } from "../lib/recipeHelpers";
import { CATEGORIES } from "../lib/constants";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import IngredientRow from "../components/form/IngredientRow";
import StepRow from "../components/form/StepRow";
import ImageUploader from "../components/form/ImageUploader";
import "../App.css";

function ShareRecipe() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Breakfast",
    serving_size: 1,
    is_public: true,
  });

  const [ingredients, setIngredients] = useState([newIngredient()]);
  const [steps, setSteps] = useState([newStep()]);
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleCoverChange = (file) => {
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleIngredientChange = (index, updated) => {
    setIngredients(ingredients.map((ing, i) => (i === index ? updated : ing)));
  };

  const handleIngredientRemove = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, updated) => {
    setSteps(steps.map((s, i) => (i === index ? updated : s)));
  };

  const handleStepRemove = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    let cover_url = null;

    if (coverFile) {
      const safeName = coverFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-covers")
        .upload(path, coverFile, { contentType: coverFile.type });

      if (uploadError) {
        setMessage(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("recipe-covers")
        .getPublicUrl(path);
      cover_url = urlData.publicUrl;
    }

    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          ...form,
          serving_size: Number(form.serving_size),
          author_id: user.id,
          cover_url,
        },
      ])
      .select()
      .single();

    if (recipeError) {
      setMessage(`Failed to save recipe: ${recipeError.message}`);
      setLoading(false);
      return;
    }

    const ingrRows = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing, i) => ({
        recipe_id: recipeData.id,
        name: ing.name,
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit,
        price_per_unit: Number(ing.price_per_unit) || 0,
        sort_order: i,
      }));

    if (ingrRows.length > 0) {
      const { error: ingrError } = await supabase.from("ingredients").insert(ingrRows);
      if (ingrError) {
        setMessage("Recipe saved but ingredients failed.");
        setLoading(false);
        return;
      }
    }

    const stepRows = steps
      .filter((s) => s.instruction.trim())
      .map((s, i) => ({
        recipe_id: recipeData.id,
        instruction: s.instruction,
        step_number: i + 1,
      }));

    if (stepRows.length > 0) {
      const { error: stepError } = await supabase.from("steps").insert(stepRows);
      if (stepError) {
        setMessage("Recipe saved but steps failed.");
        setLoading(false);
        return;
      }
    }

    navigate(`/recipes/${recipeData.id}`);
  };

  return (
    <>
      <Header displayName={user?.email} />
      <div className="app-shell">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="top-bar">
          <div>
            <p className="eyebrow">Share</p>
            <h1>New Recipe</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="section-card">
            <h2 style={{ marginTop: 0 }}>Cover Photo</h2>
            <ImageUploader previewUrl={previewUrl} onChange={handleCoverChange} />
          </div>

          <div className="section-card">
            <h2 style={{ marginTop: 0 }}>Details</h2>

            <label className="form-label">Recipe Title *</label>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="e.g. Adobo Chicken"
              required
            />

            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="A short description of the dish..."
            />

            <div className="two-col" style={{ marginTop: 18 }}>
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Serving Size</label>
                <input
                  className="form-input"
                  type="number"
                  name="serving_size"
                  value={form.serving_size}
                  onChange={handleFormChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, cursor: "pointer" }}>
              <input
                type="checkbox"
                name="is_public"
                checked={form.is_public}
                onChange={handleFormChange}
                style={{ width: "auto", marginTop: 0 }}
              />
              <span style={{ fontWeight: 600 }}>Make this recipe public</span>
            </label>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Ingredients</h2>
              <button
                type="button"
                className="small-add-btn"
                onClick={() => setIngredients([...ingredients, newIngredient()])}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              Name — Qty — Unit — Actual price (₱)
            </div>
            {ingredients.map((ing, i) => (
              <IngredientRow
                key={ing.id}
                ingredient={ing}
                index={i}
                onChange={handleIngredientChange}
                onRemove={handleIngredientRemove}
              />
            ))}
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Steps</h2>
              <button
                type="button"
                className="small-add-btn"
                onClick={() => setSteps([...steps, newStep()])}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            {steps.map((step, i) => (
              <StepRow
                key={step.id}
                step={step}
                index={i}
                onChange={handleStepChange}
                onRemove={handleStepRemove}
              />
            ))}
          </div>

          {message && <p className="message">{message}</p>}

          <button type="submit" className="primary-btn" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Publishing..." : "Publish Recipe"}
          </button>
        </form>
      </div>
      <BottomNavigation />
    </>
  );
}

export default ShareRecipe;
