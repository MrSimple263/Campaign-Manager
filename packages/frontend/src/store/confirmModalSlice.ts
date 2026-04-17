import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmButtonClass: string;
  isLoading: boolean;
  resolveCallback: string | null; // We'll use events instead of storing function
}

const initialState: ConfirmModalState = {
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  confirmButtonClass: "bg-indigo-600 hover:bg-indigo-700",
  isLoading: false,
  resolveCallback: null,
};

interface OpenConfirmPayload {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const confirmModalSlice = createSlice({
  name: "confirmModal",
  initialState,
  reducers: {
    openConfirm: (state, action: PayloadAction<OpenConfirmPayload>) => {
      state.isOpen = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.confirmText = action.payload.confirmText || "Confirm";
      state.cancelText = action.payload.cancelText || "Cancel";
      state.confirmButtonClass =
        action.payload.confirmButtonClass ||
        "bg-indigo-600 hover:bg-indigo-700";
      state.isLoading = false;
    },
    closeConfirm: (state) => {
      state.isOpen = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { openConfirm, closeConfirm, setLoading } =
  confirmModalSlice.actions;
export default confirmModalSlice.reducer;
