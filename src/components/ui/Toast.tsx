import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast = ({ message, type, duration = 5000, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: <FiCheckCircle className="h-5 w-5 text-green-500" />,
    error: <FiXCircle className="h-5 w-5 text-red-500" />,
    info: <FiInfo className="h-5 w-5 text-blue-500" />,
    warning: <FiAlertTriangle className="h-5 w-5 text-yellow-500" />,
  };

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-md p-4 shadow-lg ${bgColors[type]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            onClick={() => {
              setVisible(false);
              onClose?.();
            }}
            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // You would typically use a context or state management to add toasts
  // This is just the container component

  const removeToast = (index: number) => {
    setToasts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={index}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(index)}
        />
      ))}
    </>
  );
};