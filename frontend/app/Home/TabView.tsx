import React, { useState } from "react";
import SettingsIcon from "../components/SettingsIcon";
import { ArcherElement } from "react-archer";
import FeedbackButton from "../components/FeedbackButton";
import { BrandHeader } from "../components/BrandHeader";

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
  return (
    <div>
      <BrandHeader className="md:hidden" email={email} signOut={signOut} />
      <header className="flex border-b border-gray-200 mb-8">
        <div className="w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-4 font-medium text-sm md:text-md focus:outline-none ${
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
        </div>
        <BrandHeader
          className="hidden md:flex"
          email={email}
          signOut={signOut}
        />
      </header>
      <div>{children}</div>
    </div>
  );
};

export default TabView;
