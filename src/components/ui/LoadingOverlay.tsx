import { FiLoader } from 'react-icons/fi';

interface LoadingOverlayProps {
  fullScreen?: boolean;
  message?: string;
}

export const LoadingOverlay = ({ fullScreen = false, message }: LoadingOverlayProps) => {
  return (
    <div className={`flex items-center justify-center bg-white bg-opacity-75 ${fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0'}`}>
      <div className="text-center">
        <FiLoader className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};