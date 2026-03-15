"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Loader2, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  upload_date: string;
  category: { name: string };
  uploaded_by: { name: string };
};

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`/api/resources/${id}`);
        if (res.ok) {
          setResource(await res.json());
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResource();
  }, [id, router]);

  const handleDownload = async () => {
    if (!resource) return;
    setIsDownloading(true);
    
    try {
      // Record download telemetry
      await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: resource.id }),
      });
      
      // Trigger actual download via browser
      const link = document.createElement("a");
      link.href = resource.file_path;
      link.download = resource.title; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Failed to record download", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-[#1A5276]" />
      </div>
    );
  }

  if (!resource) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link 
        href="/dashboard"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        <div className="p-8 sm:p-10">
          <div className="flex items-center space-x-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-[#1A5276]">
              {resource.category.name}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {resource.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-400" />
              Uploaded by {resource.uploaded_by.name}
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
              {new Date(resource.upload_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div className="prose prose-blue max-w-none text-gray-700 mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="whitespace-pre-wrap leading-relaxed">
              {resource.description || "No description provided for this resource."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-[#1A5276] hover:bg-[#143d59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A5276] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {isDownloading ? "Processing..." : "Download Resource"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
