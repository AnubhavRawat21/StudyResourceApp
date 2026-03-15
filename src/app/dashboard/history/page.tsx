"use client";

import { useEffect, useState } from "react";
import { Clock, FileText, Download, Loader2 } from "lucide-react";
import Link from "next/link";

type DownloadRecord = {
  id: string;
  download_date: string;
  resource: {
    id: string;
    title: string;
    description: string | null;
    category: { name: string };
  };
};

export default function HistoryPage() {
  const [history, setHistory] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/downloads");
        setHistory(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-[#1A5276]" />
            Download History
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            A log of previously downloaded study resources.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#1A5276] hover:text-[#143d59] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
        >
          Back to Gallery
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#1A5276]" />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100">
          <Download className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No downloads yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Resources you download will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {history.map((record) => (
              <li key={record.id}>
                <Link
                  href={`/dashboard/resource/${record.resource.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6 flex items-center">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-[#1A5276] truncate">
                            {record.resource.title}
                          </p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                            in {record.resource.category.name}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>Resource Details</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex flex-col items-end">
                          <p className="text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                            Downloaded
                          </p>
                          <p className="mt-2 text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(record.download_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
