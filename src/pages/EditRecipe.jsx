import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Breakfast",
    serving_size: 1,
    is_public: true,
  });

  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    loadRecipe();
  }, [id]);

  async function loadRecipe() {
    const [recipeRes, ingrRes, stepsRes] = await Promise.all([
      supabase.from("recipes").select("*").eq("id", id).single(),
      supabase.from("ingredients").select("*").eq("recipe_id", id).order("sort_order"),
      supabase.from("steps").select("*").eq("recipe_id", id).order("step_number"),
    ]);

    if (recipeRes.error) {
      setMessage("Recipe not found.");
      setLoading(false);
      return;
    }

    const r = recipeRes.data;
    setForm({
      title: r.title,
      description: r.description || "",
      category: r.category,
      serving_size: r.serving_size,
      is_public: r.is_public,
    });
    setExistingCoverUrl(r.cover_url || "");
    setPreviewUrl(r.cover_url || "");

    setIngredients(
      (ingrRes.data || []).map((ing) => ({ ...ing, id: ing.id || crypto.randomUUID() }))
    );
    setSteps(
      (stepsRes.data || []).map((s) => ({ ...s, id: s.id || crypto.randomUUID() }))
    );
    setLoading(false);
  }

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
    setSaving(true);
    setMessage("");

    let cover_url = existingCoverUrl;

    if (coverFile) {
      const safeName = coverFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-covers")
        .upload(path, coverFile, { contentType: coverFile.type });

      if (uploadError) {
        setMessage("Failed to upload cover image.");
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("recipe-covers")
        .getPublicUrl(path);
      cover_url = urlData.publicUrl;
    }

    const { error: recipeError } = await supabase
      .from("recipes")
      .update({
        ...form,
        serving_size: Number(form.serving_size),
        cover_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (recipeError) {
      setMessage("Failed to update recipe.");
      setSaving(false);
      return;
    }

    await supabase.from("ingredients").delete().eq("recipe_id", id);
    await supabase.from("steps").delete().eq("recipe_id", id);

    const ingrRows = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing, i) => ({
        recipe_id: id,
        name: ing.name,
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit,
        price_per_unit: Number(ing.price_per_unit) || 0,
        sort_order: i,
      }));

    if (ingrRows.length > 0) {
      await supabase.from("ingredients").insert(ingrRows);
    }

    const stepRows = steps
      .filter((s) => s.instruction.trim())
      .map((s, i) => ({
        recipe_id: id,
        instruction: s.instruction,
        step_number: i + 1,
      }));

    if (stepRows.length > 0) {
      await supabase.from("steps").insert(stepRows);
    }

    navigate(`/recipes/${id}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="app-shell" style={{ textAlign: "center", paddingTop: 60 }}>
          Loading recipe...
        </div>
      </>
    );
  }

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
            <p className="eyebrow">Edit</p>
            <h1>Update Recipe</h1>
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
              required
            />

            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              value={form.description}
              onChange={handleFormChange}
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

          <button type="submit" className="primary-btn" style={{ width: "100%", justifyContent: "center" }} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
      <BottomNavigation />
    </>
  );
}

export default EditRecipe;
