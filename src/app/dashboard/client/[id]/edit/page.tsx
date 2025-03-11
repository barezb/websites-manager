// File: src/app/dashboard/client/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientData>({
    id: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients/${clientId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch client details");
      }

      const data = await response.json();
      setClient({
        id: data.id,
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        notes: data.notes || "",
      });
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: client.id,
          name: client.name,
          email: client.email || undefined,
          phone: client.phone || undefined,
          address: client.address || undefined,
          notes: client.notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update client");
      }

      // Redirect to client details page
      router.push(`/dashboard/client/${clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete client");
      }

      // Redirect to clients list
      router.push("/dashboard/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return <div>Loading client details...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Client</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div>
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
            Client Name *
          </label>
          <input
            type="text"
            id="name"
            value={client.name}
            onChange={(e) =>
              setClient((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={client.email}
            onChange={(e) =>
              setClient((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={client.phone}
            onChange={(e) =>
              setClient((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-gray-700 font-bold mb-2"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            value={client.address}
            onChange={(e) =>
              setClient((prev) => ({ ...prev, address: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-gray-700 font-bold mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={client.notes}
            onChange={(e) =>
              setClient((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            rows={4}
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Update Client
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 hover:underline"
          >
            Delete Client
          </button>
        </div>
      </form>
    </div>
  );
}
