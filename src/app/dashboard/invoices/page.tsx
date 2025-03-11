// File: src/app/dashboard/invoices/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DocumentDownloadIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/outline";

interface Invoice {
  id: string;
  amount: number;
  date: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  invoiceNumber?: string;
  description?: string;
  client: {
    id: string;
    name: string;
    email?: string;
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Clients for filter dropdown
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );

  const router = useRouter();

  useEffect(() => {
    // Fetch clients for filter dropdown
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    }

    fetchClients();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [clientFilter, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (clientFilter) params.append("clientId", clientFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/invoices?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;

    try {
      const response = await fetch(`/api/invoices?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete invoice");
      }

      // Refresh invoices
      fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "PAID":
        return "text-green-600 bg-green-100";
      case "OVERDUE":
        return "text-red-600 bg-red-100";
      case "CANCELLED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const downloadInvoice = async (invoiceNumber: string) => {
    try {
      const response = await fetch(
        `/api/invoices/download?number=${invoiceNumber}`
      );
      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <button
          onClick={() => router.push("/dashboard/invoices/create")}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div>Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No invoices found</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Invoice #</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{invoice.invoiceNumber || "N/A"}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{invoice.client.name}</span>
                      <span className="text-sm text-gray-500">
                        {invoice.client.email}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">${invoice.amount.toFixed(2)}</td>
                  <td className="p-3">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end space-x-2">
                      {invoice.invoiceNumber && (
                        <button
                          onClick={() =>
                            downloadInvoice(invoice.invoiceNumber!)
                          }
                          className="text-blue-500 hover:text-blue-600"
                          title="Download Invoice"
                        >
                          <DocumentDownloadIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          router.push(`/dashboard/invoices/${invoice.id}`)
                        }
                        className="text-green-500 hover:text-green-600"
                        title="View Invoice"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/dashboard/invoices/${invoice.id}/edit`)
                        }
                        className="text-blue-500 hover:text-blue-600"
                        title="Edit Invoice"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete Invoice"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
