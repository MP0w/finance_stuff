import React, { useState } from "react";
import { ArcherElement } from "react-archer";
import { BrandHeader } from "../components/BrandHeader";

interface Tab {
  id: string;
  label: string;
  hidden?: boolean;
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
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div>
      <BrandHeader className="md:hidden" email={email} signOut={signOut} />
      <header
        className="flex border-b border-gray-200 mb-8"
        onMouseEnter={() => setIsHovering(!isHovering)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-4 font-medium text-sm md:text-md focus:outline-none ${
                activeTab === tab.id
                  ? "border-b border-gray-800 text-gray-800"
                  : "text-gray-500 hover:text-gray-800 "
              }${tab.hidden && !isHovering ? "hidden" : ""}`}
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
