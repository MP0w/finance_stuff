import React, { useState } from "react";
import SettingsIcon from "../components/SettingsIcon";
import { ArcherElement } from "react-archer";
import FeedbackButton from "../components/FeedbackButton";

interface Tab {
  id: string;
  label: string;
}

interface TabViewProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  children: React.ReactNode;
  email?: string;
  signOut: () => void;
}

const TabView: React.FC<TabViewProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  children,
  email,
  signOut,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <header className="flex border-b border-gray-200 mb-8">
        <div className="w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-4 font-medium text-md focus:outline-none ${
                activeTab === tab.id
                  ? "border-b border-gray-800 text-gray-800"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <ArcherElement id={tab.id}>
                <div>{tab.label}</div>
              </ArcherElement>
            </button>
          ))}
        </div>{" "}
        <h1 className="py-1 text-gray-600">finance_stuff</h1>
        <div
          className="relative"
          onMouseEnter={() => setShowSettings(true)}
          onClick={() => setShowSettings(!showSettings)}
        >
          <button className="py-4 ml-4 text-gray-600 hover:text-gray-600 transition duration-200">
            <SettingsIcon />
          </button>
          {showSettings && (
            <div
              className="absolute right-0  mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              onMouseLeave={() => setShowSettings(false)}
              onClick={() => setShowSettings(false)}
            >
              <p className="px-4 py-2 text-sm text-gray-700">{email}</p>
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
      </header>
      <div>{children}</div>
    </div>
  );
};

export default TabView;
