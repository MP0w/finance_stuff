import { Expenses } from "../../../../shared/types";
import apiClient, { useApiCall } from "../../apiClient";

const api = apiClient;

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: "e" | "i" | "m";
  category: string | null;
};

// Upload a PDF file
export const useUploadPDF = () => {
  return useApiCall((pdfFile: File) => {
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);

    return apiClient.post<{
      transactions: Transaction[];
      failedPages: number[];
    }>("/expenses/upload", formData);
  });
};

export const useUpdateProposal = () => {
  return useApiCall((transactions: Expenses[], prompt: string) =>
    api.post<{
      transactions: Transaction[];
    }>("/expenses/update-proposal", { transactions, prompt })
  );
};

// Fetch expenses for a specific year and month
export const useGetExpenses = () => {
  return useApiCall((year: number, month: number) =>
    api.get<Expenses[]>(`/expenses?year=${year}&month=${month}`)
  );
};

// Fetch a single expense
export const useGetExpense = () => {
  return useApiCall((id: string) => api.get<Expenses>(`/expense/${id}`));
};

// Create a new expense
export const useCreateExpense = () => {
  return useApiCall(
    (
      expenseData: Omit<
        Expenses,
        "id" | "user_id" | "updated_at" | "created_at"
      >
    ) => api.post<void>("/expense", expenseData)
  );
};

export const useCreateBulkExpenses = () => {
  return useApiCall(
    (
      expenseData: Omit<
        Expenses,
        "id" | "user_id" | "updated_at" | "created_at"
      >[]
    ) => api.post<void>("/expenses/bulk", { expenses: expenseData })
  );
};

// Update an existing expense
export const useUpdateExpense = () => {
  return useApiCall(
    (
      id: string,
      expenseData: Omit<Expenses, "id" | "user_id" | "updated_at">
    ) => api.put<void>(`/expense/${id}`, expenseData)
  );
};

// Delete an expense
export const useDeleteExpense = () => {
  return useApiCall((id: string) => api.delete<void>(`/expense/${id}`));
};
