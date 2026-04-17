import { useConfirmModal } from "../hooks/useConfirm";

const ConfirmModal = () => {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    confirmButtonClass,
    isLoading,
    handleConfirm,
    handleCancel,
  } = useConfirmModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <div className="text-gray-600 mb-6">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${confirmButtonClass}`}
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
