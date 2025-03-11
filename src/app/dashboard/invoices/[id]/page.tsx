// File: src/app/dashboard/invoices/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DocumentDownloadIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/outline";

interface InvoiceDetails {
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
    phone?: string;
    address?: string;
  };
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoice details");
      }

      const data = await response.json();
      setInvoice(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
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

  const downloadInvoice = async () => {
    if (!invoice?.invoiceNumber) return;

    try {
      const response = await fetch(
        `/api/invoices/download?number=${invoice.invoiceNumber}`
      );
      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  const getStatusColor = () => {
    switch (invoice?.status) {
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

  if (isLoading) {
    return <div>Loading invoice details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!invoice) {
    return <div>No invoice found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Invoice #{invoice.invoiceNumber || "N/A"}
          </h1>
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor()}`}
          >
            {invoice.status}
          </span>
        </div>

        <div className="flex space-x-4">
          {invoice.invoiceNumber && (
            <button
              onClick={downloadInvoice}
              className="text-blue-500 hover:text-blue-600 flex items-center"
              title="Download Invoice"
            >
              <DocumentDownloadIcon className="w-6 h-6 mr-2" />
              Download
            </button>
          )}
          <button
            onClick={() =>
              router.push(`/dashboard/invoices/${invoice.id}/edit`)
            }
            className="text-blue-500 hover:text-blue-600 flex items-center"
            title="Edit Invoice"
          >
            <PencilIcon className="w-6 h-6 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDeleteInvoice}
            className="text-red-500 hover:text-red-600 flex items-center"
            title="Delete Invoice"
          >
            <TrashIcon className="w-6 h-6 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Invoice Details */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Amount:</strong> ${invoice.amount.toFixed(2)}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(invoice.date).toLocaleDateString()}
            </p>
            {invoice.description && (
              <p>
                <strong>Description:</strong> {invoice.description}
              </p>
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Client Details</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {invoice.client.name}
            </p>
            {invoice.client.email && (
              <p>
                <strong>Email:</strong> {invoice.client.email}
              </p>
            )}
            {invoice.client.phone && (
              <p>
                <strong>Phone:</strong> {invoice.client.phone}
              </p>
            )}
            {invoice.client.address && (
              <p>
                <strong>Address:</strong> {invoice.client.address}
              </p>
            )}
            <button
              onClick={() =>
                router.push(`/dashboard/client/${invoice.client.id}`)
              }
              className="text-blue-500 hover:underline mt-2"
            >
              View Full Client Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
