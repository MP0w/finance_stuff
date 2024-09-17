import { useState } from "react";
import FeedbackButton from "./FeedbackButton";
import SettingsIcon from "./SettingsIcon";

interface BrandHeaderProps {
  email?: string;
  signOut: () => void;
  onOpenConnectors: () => void;
  className?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  email,
  signOut,
  className,
  onOpenConnectors,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`flex justify-between ${className}`}>
      <h1 className="py-1 text-gray-600">finance_stuff</h1>
      <div
        onMouseEnter={() => setShowSettings(true)}
        onClick={() => setShowSettings(!showSettings)}
      >
        <button className="py-4 ml-4 text-gray-600 hover:text-gray-600 transition duration-200">
          <SettingsIcon />
        </button>
        {showSettings && (
          <div
            className="absolute right-0 mt-2 bg-white rounded-md shadow-lg px-2 py-1 z-10"
            onMouseLeave={() => setShowSettings(false)}
            onClick={() => setShowSettings(false)}
          >
            <p className="px-4 py-2 text-sm text-gray-700">{email}</p>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-purple-500 hover:bg-gray-100"
              onClick={onOpenConnectors}
            >
              Connect your accounts
            </button>
            <FeedbackButton />
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
              onClick={signOut}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
