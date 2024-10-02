import { useState, useEffect, useRef } from "react";
import FeedbackButton from "./FeedbackButton";
import SettingsIcon from "./SettingsIcon";
import { getCurrencySymbol, useUserState } from "../UserState";
import { useTranslation } from "react-i18next";

interface BrandHeaderProps {
  email?: string;
  signOut: () => void;
  className?: string;
  exportData: () => void;
  importData: () => void;
  hideSettings: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  email,
  signOut,
  className,
  exportData,
  importData,
  hideSettings,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useUserState();
  const { t } = useTranslation();
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCurrencyChange = async (currency: string) => {
    user?.updateUserPrefs({ currency });
  };

  return (
    <div className={`flex justify-between ${className}`}>
      <h1 className="py-1" hidden={hideSettings}>
        finance_stuff
      </h1>
      <div
        ref={settingsRef}
        onMouseEnter={() => setShowSettings(true)}
        onClick={() => setShowSettings(true)}
        hidden={hideSettings}
      >
        <button className="py-4 ml-4 transition duration-200">
          <SettingsIcon />
        </button>
        {showSettings && (
          <div className="absolute right-0 mt-2 bg-white rounded-md shadow-lg px-2 py-1 z-10 text-sm">
            <p className="px-4 py-2 font-bold">{email}</p>
            <div className="px-4 py-2">
              <p className="text-gray-800 mb-2">{t("brandHeader.currency")}</p>
              <div className="flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-6 py-1 text-sm font-md bg-gray-100 border border-gray-200 rounded-l-lg hover:bg-gray-400 focus:z-10 focus:ring-2 focus:ring-blue-600 focus:text-blue-600 ${
                    user?.currency === "USD" ? "bg-gray-600 text-white" : ""
                  }`}
                  onClick={() => handleCurrencyChange("USD")}
                >
                  {getCurrencySymbol("USD")}
                </button>
                <button
                  type="button"
                  className={`px-6 py-1 text-sm font-md bg-gray-100 border border-gray-200 rounded-r-lg hover:bg-gray-400 focus:z-10 focus:ring-2 focus:ring-blue-600 focus:text-blue-600 ${
                    user?.currency === "EUR" ? "bg-gray-600 text-white" : ""
                  }`}
                  onClick={() => handleCurrencyChange("EUR")}
                >
                  {getCurrencySymbol("EUR")}
                </button>
              </div>
            </div>
            <button
              className="block w-full text-left px-4 py-2  hover:bg-gray-100"
              onClick={exportData}
            >
              {t("brandHeader.exportData")}
            </button>
            <button
              className="block w-full text-left px-4 py-2  hover:bg-gray-100"
              onClick={importData}
            >
              {t("brandHeader.importFromSheet")}
            </button>
            <FeedbackButton />
            <button
              className="block w-full text-left px-4 py-2  hover:bg-gray-100"
              onClick={() => window.open("/privacy", "_blank")}
            >
              {t("brandHeader.privacyPolicy")}
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100"
              onClick={signOut}
            >
              {t("brandHeader.logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
