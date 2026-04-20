"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (res.ok) {
        setNewCategory("");
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Subject</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g., Mathematics, Computer Science"
            className="flex-1 text-black appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1A5276] focus:border-[#1A5276] sm:text-sm"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1A5276] hover:bg-[#143d59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A5276] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5 mr-1" />
                Add
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="px-4 py-5 sm:p-6 text-gray-900">
          <h2 className="text-lg font-medium mb-4">Existing Subjects</h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#1A5276]" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No subjects found. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="py-4 flex justify-between items-center"
                >
                  <span className="font-medium text-gray-900">
                    {category.name}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
