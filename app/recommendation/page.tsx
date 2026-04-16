"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createRecommendation,
  fetchCategories,
  fetchRecommendations,
  type Category,
  type Recommendation,
} from "@/services/api/recommendation";

export default function RecommendationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasRecommendations = recommendations.length > 0;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const recommendationData = await fetchRecommendations();
        if (!isMounted) return;
        setRecommendations(recommendationData);

        if (recommendationData.length === 0) {
          const categoryData = await fetchCategories();
          if (!isMounted) return;
          setCategories(categoryData);
          if (categoryData.length > 0) {
            setSelectedCategoryId(String(categoryData[0].id));
          }
        }
      } catch (loadError) {
        if (!isMounted) return;
        const message =
          loadError instanceof Error ? loadError.message : "Failed to load recommendations.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateRecommendation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCategoryId) {
      setError("Please choose a category to create recommendations.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createRecommendation(selectedCategoryId);
      const recommendationData = await fetchRecommendations();
      setRecommendations(recommendationData);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Could not create recommendation.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-8 font-sans">
      <button
        type="button"
        aria-label="Open user menu"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-full border border-zinc-300 bg-white p-2 text-zinc-700 shadow-sm transition hover:bg-zinc-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
        </svg>
      </button>

      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30"
        />
      ) : null}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white p-6 shadow-xl transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">User Menu</h2>
          <button
            type="button"
            aria-label="Close user menu"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-1 text-zinc-600 transition hover:bg-zinc-100"
          >
            ✕
          </button>
        </div>
        <nav className="mt-6 space-y-2">
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Settings
          </button>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Edit profile
          </button>
        </nav>
      </aside>

      <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Recommendations</h1>
        {isLoading ? (
          <p className="mt-2 text-sm text-zinc-600">Loading recommendations...</p>
        ) : null}

        {!isLoading && hasRecommendations ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-zinc-600">Here are your current recommendations:</p>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => {
                const label =
                  recommendation.title ??
                  recommendation.category ??
                  recommendation.categories ??
                  `Recommendation ${index + 1}`;

                return (
                  <li
                    key={String(recommendation.id ?? index)}
                    className="rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {!isLoading && !hasRecommendations ? (
          <div className="mt-4">
            <p className="text-sm text-zinc-600">
              You don&apos;t have recommendations yet. Create one by selecting a category.
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleCreateRecommendation}>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-zinc-700"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={String(category.id)} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
              <button
                type="submit"
                disabled={isSubmitting || categories.length === 0}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
              >
                {isSubmitting ? "Creating..." : "Create Recommendation"}
              </button>
            </form>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>
    </main>
  );
}
