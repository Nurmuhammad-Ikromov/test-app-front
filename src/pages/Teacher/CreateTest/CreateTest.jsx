import React, { useState } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import Modal from "../../../components/Modal/Modal";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/config";

const CreateTest = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [type, setType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!file || !fileName.trim()) {
      alert("Please provide a file and a name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", fileName);
    formData.append("type", type);

    try {
      const response = await API.post("/test/create", formData);
      const data = await response.data
      if (data) {
        alert("File uploaded successfully!");
        setFile(null);
        setFileName("");
        setIsModalOpen(false);

        // console.log(data);

        navigate(`/tests/${data.link}`)



      } else {
        alert("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  return (
    <div className="p-8">
      <Navbar title="Test yaratish" />

      <div className="flex flex-col items-center justify-center min-h-[550px] bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="mb-4">
            <img
              width={291}
              height={200}
              src="/FileUpload.png"
              alt="File Upload Illustration"
              className="mx-auto"
            />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Drag and Drop Your File Here!
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Please upload PDF, DOCX, DOC, or XLSX files. <br />
            A file maximum size should be 5 MB.
          </p>
          <div className="flex items-center justify-center mt-6 space-x-4">
            <label
              htmlFor="file"
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 focus:outline-none"
            >
              Upload a File
            </label>
            <input type="file" id="file" hidden onChange={handleFileChange} />
            <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 focus:outline-none" onClick={() => setIsModalOpen(true)}>
              Enter Data Manually
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && <Modal handleSubmit={handleSubmit} fileName={fileName} setFileName={setFileName} setIsModalOpen={setIsModalOpen} type={type} setType={setType} />}
    </div>
  );
};

export default CreateTest;
