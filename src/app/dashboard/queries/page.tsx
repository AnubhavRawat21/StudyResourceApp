"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, MessageSquare, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

type Query = {
  id: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
};

export default function StudentQueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await fetch("/api/queries");
      if (res.ok) {
        setQueries(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description }),
      });
      
      if (res.ok) {
        setSubject("");
        setDescription("");
        setShowForm(false);
        fetchQueries();
      } else {
        alert("Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request specific study materials or resources from the admin.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1A5276] hover:bg-[#143d59] transition-colors"
        >
          {showForm ? "Cancel" : "New Request"}
          {!showForm && <Plus className="ml-2 h-4 w-4" />}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Submit a New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject or Topic
              </label>
              <input
                type="text"
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1A5276] focus:border-[#1A5276] sm:text-sm bg-white"
                placeholder="e.g. Past Papers for Mathematics 101"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Detailed Description
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1A5276] focus:border-[#1A5276] sm:text-sm bg-white"
                placeholder="Please describe exactly what you are looking for..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1A5276] hover:bg-[#143d59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A5276] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1A5276]" />
        </div>
      ) : queries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No requests yet</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            You haven't made any resource requests. Click "New Request" to ask for specific materials.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <div key={query.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{query.subject}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    query.status === "RESOLVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {query.status === "RESOLVED" ? (
                    <CheckCircle className="mr-1.5 h-3 w-3" />
                  ) : (
                    <Clock className="mr-1.5 h-3 w-3" />
                  )}
                  {query.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{query.description}</p>
              <div className="mt-4 text-xs text-gray-400">
                Requested on {new Date(query.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
