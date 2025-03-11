// File: src/app/dashboard/websites/add/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const TECHNOLOGIES = [
  "Next.js",
  "React",
  "Vue.js",
  "Angular",
  "WordPress",
  "Shopify",
  "HTML/CSS",
  "Node.js",
  "PHP",
  "Python",
  "Laravel",
];

export default function AddWebsitePage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [hostProvider, setHostProvider] = useState("");
  const [domainRenewal, setDomainRenewal] = useState("");
  const [hostRenewal, setHostRenewal] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [clientId, setClientId] = useState("");
  const [loginInfo, setLoginInfo] = useState({
    adminUrl: "",
    username: "",
    password: "",
  });
  const [notes, setNotes] = useState("");

  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Fetch categories and clients
    async function fetchData() {
      try {
        const [categoriesRes, clientsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/clients"),
        ]);

        const categoriesData = await categoriesRes.json();
        const clientsData = await clientsRes.json();

        setCategories(categoriesData);
        setClients(clientsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          url,
          technologies,
          hostProvider,
          domainRenewal: domainRenewal
            ? new Date(domainRenewal).toISOString()
            : null,
          hostRenewal: hostRenewal ? new Date(hostRenewal).toISOString() : null,
          categoryId,
          clientId,
          loginInfo,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create website");
      }

      router.push("/dashboard/websites");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const toggleTechnology = (tech: string) => {
    setTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Website</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-lg shadow-md"
      >
        {/* Previous input fields... */}

        <div>
          <label className="block text-gray-700 font-bold mb-2">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">Select Client</option>
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Login Information
          </label>
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Admin URL"
              value={loginInfo.adminUrl}
              onChange={(e) =>
                setLoginInfo((prev) => ({
                  ...prev,
                  adminUrl: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
            <div className="grid md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Username"
                value={loginInfo.username}
                onChange={(e) =>
                  setLoginInfo((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginInfo.password}
                onChange={(e) =>
                  setLoginInfo((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            rows={4}
            placeholder="Any additional information about the website..."
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.push("/dashboard/websites")}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Website
          </button>
        </div>
      </form>
    </div>
  );
}
