import { useCallback } from "react";

import {
  openConfirm,
  closeConfirm,
  setLoading,
} from "../store/confirmModalSlice";
import { useAppSelector, useAppDispatch } from "../store/hooks";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm?: () => Promise<void> | void;
}

// Global promise resolver - used to resolve the confirm promise
let resolvePromise: ((value: boolean) => void) | null = null;

export const useConfirm = () => {
  const dispatch = useAppDispatch();

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        resolvePromise = resolve;
        dispatch(openConfirm(options));
      });
    },
    [dispatch],
  );

  return confirm;
};

// Hook for the modal component to handle confirm/cancel
export const useConfirmModal = () => {
  const dispatch = useAppDispatch();
  const modalState = useAppSelector((state) => state.confirmModal);

  const handleConfirm = useCallback(async () => {
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
    dispatch(closeConfirm());
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
    dispatch(closeConfirm());
  }, [dispatch]);

  const setModalLoading = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch],
  );

  return {
    ...modalState,
    handleConfirm,
    handleCancel,
    setLoading: setModalLoading,
  };
};
