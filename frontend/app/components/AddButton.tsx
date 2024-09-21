import React from "react";

interface AddButtonProps {
  title?: string;
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ title, onClick }) => {
  return (
    <button className="flex items-center mb-2" onClick={onClick}>
      <div className="pixel-corners-small bg-gray-300 w-6 h-6 flex items-center justify-center">
        <span className="text-lg">+</span>
      </div>
      {title && <span className="rounded text-sl ml-2 text-left">{title}</span>}
    </button>
  );
};

export default AddButton;
