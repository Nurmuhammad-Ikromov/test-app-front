import React from "react";

const Modal = ({
  fileName,
  setIsModalOpen,
  setFileName,
  handleSubmit,
  type,
  setType,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Enter File Name
        </h2>
        <input
          type="text"
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
        />
        <select
          name="type"
          value={type}
          id=""
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
        >
          <option>Tanlang</option>
          <option value="test">Test</option>
          <option value="writing">Yozma</option>
          <option value="practise">Amaliy</option>
        </select>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
