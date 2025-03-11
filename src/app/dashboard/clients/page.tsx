// File: src/app/dashboard/clients/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {  PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  websiteCount: number
  paymentCount: number
  notes?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [editingClient, setEditingClient] = useState<Partial<Client>>({});
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/clients");

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();
      setClients(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail || undefined,
          phone: newClientPhone || undefined,
          notes: newClientNotes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create client");
      }

      // Reset form and refresh clients
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      setNewClientNotes("");
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient.id || !editingClient.name) return;

    try {
      const response = await fetch("/api/clients", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingClient.id,
          name: editingClient.name,
          email: editingClient.email || undefined,
          phone: editingClient.phone || undefined,
          notes: editingClient.notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update client");
      }

      // Reset editing state and refresh clients
      setEditingClient({});
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const response = await fetch(`/api/clients?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete client");
      }

      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Clients Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Client Creation/Editing Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingClient.id ? "Edit Client" : "Create New Client"}
          </h2>

          <form
            onSubmit={
              editingClient.id ? handleUpdateClient : handleCreateClient
            }
            className="space-y-4"
          >
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={
                  editingClient.id ? editingClient.name || "" : newClientName
                }
                onChange={(e) =>
                  editingClient.id
                    ? setEditingClient((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    : setNewClientName(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={
                  editingClient.id ? editingClient.email || "" : newClientEmail
                }
                onChange={(e) =>
                  editingClient.id
                    ? setEditingClient((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    : setNewClientEmail(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={
                  editingClient.id ? editingClient.phone || "" : newClientPhone
                }
                onChange={(e) =>
                  editingClient.id
                    ? setEditingClient((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    : setNewClientPhone(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Notes
              </label>
              <textarea
                value={
                  editingClient.id ? editingClient.notes || "" : newClientNotes
                }
                onChange={(e) =>
                  editingClient.id
                    ? setEditingClient((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    : setNewClientNotes(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                rows={4}
                placeholder="Additional client information"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                {editingClient.id ? "Update" : "Create"}
              </button>
              {editingClient.id && (
                <button
                  type="button"
                  onClick={() => setEditingClient({})}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Clients List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Clients</h2>

          {clients.length === 0 ? (
            <p className="text-gray-500">No clients found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li
                  key={client.id}
                  className="flex justify-between items-center py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{client.name}</span>
                      {client.email && (
                        <span className="text-sm text-gray-500">
                          ({client.email})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.websiteCount} websites | {client.paymentCount}{" "}
                      payments
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/client/${client.id}`}
                      className="text-blue-500 hover:text-blue-600"
                      title="View Client Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setEditingClient(client)}
                      className="text-blue-500 hover:text-blue-600"
                      title="Edit Client"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete Client"
                      disabled={
                        client.websiteCount > 0 || client.paymentCount > 0
                      }
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