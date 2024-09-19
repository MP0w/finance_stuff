import React from "react";
import { ArcherElement } from "react-archer";
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
  exportData: () => void;
  signOut: () => void;
}

const TabView: React.FC<TabViewProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  children,
  email,
  exportData,
  signOut,
}) => {
  function renderTab(tab: Tab) {
    return (
      <button
        key={tab.id}
        className={`py-4 px-4 font-medium text-sm md:text-md focus:outline-none ${
          activeTab === tab.id
            ? "border-b border-gray-800 text-gray-800"
            : "text-gray-500 hover:text-gray-800 "
        }`}
        onClick={() => setActiveTab(tab.id)}
      >
        <ArcherElement id={tab.id}>
          <div>{tab.label}</div>
        </ArcherElement>
      </button>
    );
  }

  return (
    <div>
      <BrandHeader
        className="md:hidden"
        email={email}
        signOut={signOut}
        exportData={exportData}
      />
      <header className="flex border-b border-gray-200 mb-8">
        <div className="w-full">{tabs.map((tab) => renderTab(tab))}</div>
        <BrandHeader
          className="hidden md:flex"
          email={email}
          signOut={signOut}
          exportData={exportData}
        />
      </header>
      <div>{children}</div>
    </div>
  );
};

export default TabView;
