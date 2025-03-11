// File: src/app/dashboard/websites/page.tsx

"use client";

import { useState, useEffect } from "react";
import { WebsiteStatus } from "@prisma/client";
import Link from "next/link";


export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWebsites() {
      try {
        const response = await fetch("/api/websites");
        if (!response.ok) {
          throw new Error("Failed to fetch websites");
        }
        const data = await response.json();
        setWebsites(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching websites:", error);
        setIsLoading(false);
      }
    }

    fetchWebsites();
  }, []);

  const getStatusColor = (status: WebsiteStatus) => {
    switch (status) {
      case "RUNNING":
        return "bg-green-500";
      case "PROBLEMATIC":
        return "bg-yellow-500";
      case "STOPPED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return <div>Loading websites...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Websites</h1>
        <Link
          href="/dashboard/websites/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Add New Website
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <div
            key={website.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{website.name}</h2>
              <span
                className={`h-3 w-3 rounded-full ${getStatusColor(
                  website.status
                )}`}
                title={website.status}
              />
            </div>

            <div className="space-y-2 text-gray-600">
              <p>
                <strong>URL:</strong>
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:underline"
                >
                  {website.url}
                </a>
              </p>
              <p>
                <strong>Technologies:</strong> {website.technologies.join(", ")}
              </p>
              <p>
                <strong>Host:</strong> {website.hostProvider || "Not specified"}
              </p>

              <div className="flex justify-between mt-4">
                <Link
                  href={`/dashboard/websites/${website.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Details
                </Link>
                <Link
                  href={`/dashboard/websites/${website.id}/edit`}
                  className="text-gray-500 hover:underline"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {websites.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>No websites found. Add your first website!</p>
        </div>
      )}
    </div>
  );
}
