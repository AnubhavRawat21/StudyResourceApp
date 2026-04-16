"use client";

import { useState, useEffect } from "react";
import { Loader2, MessageSquare, CheckCircle, Clock } from "lucide-react";

type Query = {
  id: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function AdminQueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "PENDING" ? "RESOLVED" : "PENDING";
    
    try {
      const res = await fetch(`/api/queries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        fetchQueries();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage study material requests from students.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1A5276]" />
        </div>
      ) : queries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No student requests</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            You currently do not have any incoming requests from students.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {queries.map((query) => (
              <li key={query.id} className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {query.subject}
                      </h3>
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
                    
                    <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">
                      {query.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 inline-flex px-3 py-1.5 rounded-md border border-gray-100">
                      <span className="font-medium mr-2">Requested by:</span>
                      {query.user.name} <span className="mx-1 text-gray-300">|</span> {query.user.email} <span className="mx-1 text-gray-300">|</span> {new Date(query.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                    <button
                      onClick={() => handleUpdateStatus(query.id, query.status)}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none transition-colors ${
                        query.status === "PENDING"
                          ? "border-transparent text-white bg-[#1A5276] hover:bg-[#143d59]"
                          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {query.status === "PENDING" ? "Mark as Resolved" : "Mark as Pending"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
