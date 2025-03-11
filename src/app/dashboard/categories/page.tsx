// File: src/app/dashboard/categories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {  PencilIcon, TrashIcon } from '@heroicons/react/outline'

interface Category {
  id: string
  name: string
  color?: string
  websiteCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName,
          color: newCategoryColor || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      // Reset form and refresh categories
      setNewCategoryName("");
      setNewCategoryColor("");
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory.id || !editingCategory.name) return;

    try {
      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editingCategory.name,
          color: editingCategory.color || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      // Reset editing state and refresh categories
      setEditingCategory({});
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Categories Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Category Creation/Editing Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory.id ? "Edit Category" : "Create New Category"}
          </h2>

          <form
            onSubmit={
              editingCategory.id ? handleUpdateCategory : handleCreateCategory
            }
            className="space-y-4"
          >
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={
                  editingCategory.id
                    ? editingCategory.name || ""
                    : newCategoryName
                }
                onChange={(e) =>
                  editingCategory.id
                    ? setEditingCategory((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    : setNewCategoryName(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Category Color (Optional)
              </label>
              <input
                type="color"
                value={
                  editingCategory.id
                    ? editingCategory.color || "#000000"
                    : newCategoryColor
                }
                onChange={(e) =>
                  editingCategory.id
                    ? setEditingCategory((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    : setNewCategoryColor(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                {editingCategory.id ? "Update" : "Create"}
              </button>
              {editingCategory.id && (
                <button
                  type="button"
                  onClick={() => setEditingCategory({})}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex justify-between items-center py-3"
                >
                  <div className="flex items-center space-x-3">
                    {category.color && (
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">
                      ({category.websiteCount} websites)
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-500 hover:text-blue-600"
                      title="Edit Category"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete Category"
                      disabled={category.websiteCount > 0}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}