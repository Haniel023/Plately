import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import AppLoader from "./components/common/AppLoader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import RecipeDetail from "./pages/RecipeDetail";
import ShareRecipe from "./pages/ShareRecipe";
import EditRecipe from "./pages/EditRecipe";
import MyRecipes from "./pages/MyRecipes";
import MealPlanner from "./pages/MealPlanner";
import ExpenseTracker from "./pages/ExpenseTracker";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  if (session === undefined) return <AppLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (appLoading) return <AppLoader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/browse" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/users/:id" element={<PublicProfile />} />
        <Route
          path="/share"
          element={
            <ProtectedRoute>
              <ShareRecipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <EditRecipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-recipes"
          element={
            <ProtectedRoute>
              <MyRecipes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <MealPlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpenseTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
