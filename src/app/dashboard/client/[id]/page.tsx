// File: src/app/dashboard/client/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/outline";

interface ClientDetails {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  websites: Array<{
    id: string;
    name: string;
    url: string;
    technologies: string[];
    status: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
    invoiceNumber?: string;
  }>;
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientDetails | null>(null);
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
      setClient(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "RUNNING":
        return "text-green-600";
      case "PROBLEMATIC":
        return "text-yellow-600";
      case "STOPPED":
        return "text-red-600";
      case "PENDING":
        return "text-blue-600";
      case "PAID":
        return "text-green-600";
      case "OVERDUE":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return <div>Loading client details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!client) {
    return <div>No client found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{client.name}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/client/${client.id}/edit`}
            className="text-blue-500 hover:text-blue-600"
          >
            <PencilIcon className="w-6 h-6" />
          </Link>
          <button
            className="text-red-500 hover:text-red-600"
            // onClick={handleDelete}
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Client Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="space-y-2">
            {client.email && (
              <p>
                <strong>Email:</strong> {client.email}
              </p>
            )}
            {client.phone && (
              <p>
                <strong>Phone:</strong> {client.phone}
              </p>
            )}
            {client.address && (
              <p>
                <strong>Address:</strong> {client.address}
              </p>
            )}
            {client.notes && (
              <div>
                <strong>Notes:</strong>
                <p className="text-gray-600">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Websites */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Websites</h2>
          {client.websites.length === 0 ? (
            <p className="text-gray-500">No websites found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {client.websites.map((website) => (
                <li key={website.id} className="py-3">
                  <Link
                    href={`/dashboard/websites/${website.id}`}
                    className="flex justify-between items-center hover:bg-gray-50 p-2 rounded"
                  >
                    <div>
                      <span className="font-medium">{website.name}</span>
                      <p className="text-sm text-gray-500">{website.url}</p>
                      <p className="text-sm text-gray-500">
                        {website.technologies.join(", ")}
                      </p>
                    </div>
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusColor(
                        website.status
                      )}`}
                      title={website.status}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Payments */}
        <div className="bg-white shadow-md rounded-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>
          {client.payments.length === 0 ? (
            <p className="text-gray-500">No payments found</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {client.payments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="p-2">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="p-2">${payment.amount.toFixed(2)}</td>
                    <td className="p-2">
                      <span className={getStatusColor(payment.status)}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {payment.invoiceNumber ? (
                        <Link
                          href={`/invoices/${payment.invoiceNumber}`}
                          className="text-blue-500 hover:underline"
                        >
                          {payment.invoiceNumber}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
