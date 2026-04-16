export type Recommendation = {
  id: number | string;
  category?: string;
  categories?: string;
  title?: string;
};

export type Category = {
  id: number | string;
  name: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const response = await fetch(buildUrl("/api/v1/recommendations"), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`Failed to fetch recommendations (${response.status})`);
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(buildUrl("/api/v1/categories"), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories (${response.status})`);
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      if (typeof item === "string") {
        return { id: index, name: item };
      }
      return {
        id: item.id ?? index,
        name: item.name ?? item.category ?? item.categories ?? `Category ${index + 1}`,
      };
    });
  }

  return [];
}

export async function createRecommendation(categoryId: string): Promise<void> {
  const response = await fetch(buildUrl("/api/v1/recommendations"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category_id: categoryId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create recommendation (${response.status})`);
  }
}
