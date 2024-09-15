import React from "react";

interface AddButtonProps {
  title?: string;
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ title, onClick }) => {
  return (
    <button className="flex items-center" onClick={onClick}>
      <div className="bg-gray-300 text-gray-600 rounded-lg w-6 h-6 flex items-center justify-center">
        <span className="text-lg">+</span>
      </div>
      {title && (
        <span className="text-gray-600 rounded text-sl ml-2">{title}</span>
      )}
    </button>
  );
};

export default AddButton;
