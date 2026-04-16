"use client";

import { useState, useEffect } from "react";
import { Search, Filter, FileText, Download, Loader2 } from "lucide-react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
};

type Resource = {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  upload_date: string;
  category: Category;
  uploaded_by: { name: string };
};

export default function DashboardPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [searchQuery, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      setCategories(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/resources/search?${params.toString()}`);
      setResources(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Study Resources</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/queries"
            className="text-sm font-medium text-[#1A5276] hover:text-[#143d59] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
          >
            Request Resource
          </Link>
          <Link
            href="/dashboard/history"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
          >
            History
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-[#1A5276] focus:ring-1 focus:ring-[#1A5276] sm:text-sm"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:border-[#1A5276] focus:ring-1 focus:ring-[#1A5276] sm:text-sm"
          >
            <option value="">All Subjects</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Gallery */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#1A5276]" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white flex flex-col justify-between overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[#1A5276]">
                    {resource.category.name}
                  </span>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="mt-2 text-xl font-semibold text-gray-900 line-clamp-1">
                  {resource.title}
                </h3>
                <p className="mt-3 text-sm text-gray-500 line-clamp-3 h-16">
                  {resource.description || "No description provided."}
                </p>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  By {resource.uploaded_by.name}
                </div>
                <Link
                  href={`/dashboard/resource/${resource.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#1A5276] hover:bg-[#143d59] focus:outline-none transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
