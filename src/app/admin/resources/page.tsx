"use client";

import { useEffect, useState, useRef } from "react";
import { Trash2, Upload, Loader2, FileText, Download } from "lucide-react";

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
  uploaded_by: { name: string; email: string };
};

export default function ManageResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resRes, catRes] = await Promise.all([
        fetch("/api/resources"),
        fetch("/api/categories")
      ]);
      setResources(await resRes.json());
      setCategories(await catRes.json());
    } catch (err) {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !categoryId) return;
    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("categoryId", categoryId);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setCategoryId("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchData();
      } else {
        const msg = await res.text();
        setError(msg || "Upload failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete resource");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Resources</h1>
      </div>

      {/* Upload Form */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2 text-[#1A5276]" />
          Upload New Resource
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1A5276] focus:border-[#1A5276] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1A5276] focus:border-[#1A5276] sm:text-sm rounded-md"
              >
                <option value="" disabled>Select a subject</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1A5276] focus:border-[#1A5276] sm:text-sm"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">File Attachment (PDF, DOCX, PPTX max 10MB)</label>
             <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              accept=".pdf,.docx,.pptx"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#1A5276] hover:file:bg-blue-100"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1A5276] hover:bg-[#143d59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A5276] disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Upload className="h-5 w-5 mr-2" />}
              Upload Resource
            </button>
          </div>
        </form>
      </div>

      {/* Resource Table */}
      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Uploaded Resources</h3>
          <span className="bg-blue-100 text-[#1A5276] py-1 px-3 rounded-full text-xs font-medium">
            {resources.length} Total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Uploader</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#1A5276]" />
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No resources uploaded yet. Fill the form above to add your first resource.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-[#1A5276] rounded-md">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{resource.description || "No description"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {resource.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(resource.upload_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{resource.uploaded_by.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <a href={resource.file_path} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1A5276] inline-block p-1">
                        <Download className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleDelete(resource.id, resource.title)} className="text-gray-400 hover:text-red-500 inline-block p-1">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
