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
  hideSettings?: boolean;
}

const TabView: React.FC<TabViewProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  children,
  email,
  exportData,
  signOut,
  hideSettings,
}) => {
  function renderTab(tab: Tab) {
    return (
      <button
        key={tab.id}
        className={`p-3 md:p-4 text-sm md:text-md focus:outline-none hover:text-black ${
          activeTab === tab.id ? " font-bold" : "font-medium"
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
      <header className="tallscreen:sticky tallscreen:top-0 tallscreen:z-10 bg-gray-100 shadow-md">
        <div className="pt-2 mx-4">
          <BrandHeader
            className="md:hidden"
            email={email}
            signOut={signOut}
            exportData={exportData}
            importData={() => setActiveTab("import")}
            hideSettings={hideSettings ?? false}
          />
          <div className="flex">
            <div className="w-full">{tabs.map((tab) => renderTab(tab))}</div>
            <BrandHeader
              className="hidden md:flex"
              email={email}
              signOut={signOut}
              exportData={exportData}
              importData={() => setActiveTab("import")}
              hideSettings={hideSettings ?? false}
            />
          </div>
        </div>
      </header>
      <div className="p-8">{children}</div>
    </div>
  );
};

export default TabView;
