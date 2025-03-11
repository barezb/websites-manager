// File: src/app/dashboard/invoices/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  email?: string
}

interface InvoiceData {
  id: string
  amount: number
  date: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  description?: string
  client: {
    id: string
    name: string
  }
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  // Form state
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  // Clients list
  const [clients, setClients] = useState<Client[]>([]);

  // Error and loading states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch invoice details and clients on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch invoice details
        const invoiceResponse = await fetch(`/api/invoices/${invoiceId}`);
        if (!invoiceResponse.ok) {
          throw new Error("Failed to fetch invoice details");
        }
        const invoiceData = await invoiceResponse.json();
        setInvoice(invoiceData);

        // Populate form with existing data
        setClientId(invoiceData.client.id);
        setAmount(invoiceData.amount.toString());
        setDescription(invoiceData.description || "");
        setDate(new Date(invoiceData.date).toISOString().split("T")[0]);
        setStatus(invoiceData.status);

        // Fetch clients
        const clientsResponse = await fetch("/api/clients");
        if (!clientsResponse.ok) {
          throw new Error("Failed to fetch clients");
        }
        const clientsData = await clientsResponse.json();
        setClients(clientsData);

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    }

    fetchData();
  }, [invoiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!clientId) {
        throw new Error("Please select a client");
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          amount: numericAmount,
          description: description || undefined,
          date,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update invoice");
      }

      // Redirect to invoice details page
      router.push(`/dashboard/invoices/${invoiceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;

    try {
      const response = await fetch(`/api/invoices?id=${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete invoice");
      }

      // Redirect to invoices list
      router.push("/dashboard/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return <div>Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div>No invoice found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Invoice</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div>
          <label
            htmlFor="client"
            className="block text-gray-700 font-bold mb-2"
          >
            Client *
          </label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required
          >
            <option value="">Select a Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.email ? `(${client.email})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-gray-700 font-bold mb-2"
          >
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-gray-700 font-bold mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            rows={4}
            placeholder="Optional invoice description"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 font-bold mb-2"
            >
              Invoice Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-gray-700 font-bold mb-2"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            Update Invoice
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 hover:underline"
          >
            Delete Invoice
          </button>
        </div>
      </form>
    </div>
  );
}