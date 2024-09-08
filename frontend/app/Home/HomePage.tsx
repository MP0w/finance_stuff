import React from "react";
import { useUserState } from "../UserState";

interface HomePageProps {
  signOut: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ signOut }) => {
  const { userId } = useUserState();

  if (!userId) {
    throw Error("invalid state");
  }

  const data = [
    { id: 1, name: "222", email: "dcwcddw" },
    { id: 3, name: "2jn22", email: "aaa" },
    { id: 4, name: "22kj2", email: "kkk" },
    { id: 5, name: "hghgj", email: "hhjhj" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header with Logout Button */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Welcome, {userId}</h1>
        <button
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition"
          onClick={signOut}
        >
          Logout
        </button>
      </header>

      {/* Table to Display Data */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="text-center border-t">
                <td className="px-4 py-2 text-gray-900">{item.id}</td>
                <td className="px-4 py-2 text-gray-900">{item.name}</td>
                <td className="px-4 py-2 text-gray-900">{item.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;
