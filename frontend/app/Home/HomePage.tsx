import React, { useState } from "react";
import { useUserState } from "../UserState";
import SettingsIcon from "./SettingsIcon";

interface HomePageProps {
  signOut: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ signOut }) => {
  const { userId, email } = useUserState();
  const [showSettings, setShowSettings] = useState(false);

  if (!userId) {
    throw Error("invalid state");
  }

  const data = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com" },
    { id: 4, name: "Alice Brown", email: "alice@example.com" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">SimpleFi</h1>
          <div className="relative">
            <button
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition duration-200"
              onMouseEnter={() => setShowSettings(true)}
              onMouseLeave={() => setShowSettings(false)}
            >
              <SettingsIcon />
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <p className="px-4 py-2 text-lg text-gray-900">{email}</p>
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

        <div className="bg-white shadow-md rounded-lg p-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-gray-700">Email</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-gray-800">{item.id}</td>
                  <td className="px-4 py-2 text-gray-800">{item.name}</td>
                  <td className="px-4 py-2 text-gray-800">{item.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
