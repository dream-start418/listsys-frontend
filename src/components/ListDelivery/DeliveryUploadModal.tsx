import React, { useState } from "react";

interface DeliveryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, listCount: number | null) => void;
}

const DeliveryUploadModal: React.FC<DeliveryUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [listCount, setListCount] = useState<string>("");

  // Check if the selected file is a zip
  const isZip = selectedFile?.name.toLowerCase().endsWith(".zip");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setListCount(""); // Reset list count when file changes
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      if (isZip) {
        onUpload(selectedFile, null); // null means not required
      } else if (listCount && !isNaN(Number(listCount))) {
        onUpload(selectedFile, Number(listCount));
      }
      setSelectedFile(null);
      setListCount("");
    }
  };

  // Upload button enabled if:
  // - file is zip (listCount not required)
  // - file is not zip and listCount is filled
  const canUpload =
    !!selectedFile && (isZip || (!!listCount && !isNaN(Number(listCount))));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-[#d9edf2] rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-lg font-bold mb-6 text-gray-700">納品ファイルアップロード</h2>
        {/* File select row */}
        <div className="flex items-center mb-4">
          <label
            htmlFor="fileInput"
            className="w-32 inline-block bg-white border border-gray-300 px-3 py-2 rounded cursor-pointer text-gray-700 text-sm animate-pulse"
          >
            ファイルを選択
            <input
              type="file"
              accept=".zip,.xlsx,.csv"
              className="hidden"
              id="fileInput"
              onChange={handleFileChange}
            />
          </label>
          <div className="flex-1 ml-2">
            <input
              type="text"
              value={selectedFile ? selectedFile.name : ""}
              readOnly
              className="w-full bg-green-300 text-gray-800 px-3 py-2 rounded border border-green-400 outline-none"
              placeholder="ファイル名"
            />
          </div>
        </div>
        {/* List count row */}
        {!isZip && (
          <div className="flex items-center mb-6">
            <label className="w-32 py-2 px-3 text-center text-gray-700">リスト数</label>
            <input
              type="number"
              min={1}
              value={listCount}
              onChange={(e) => setListCount(e.target.value)}
              className="flex-1 ml-2 bg-green-300 text-gray-800 px-3 py-2 rounded border border-green-400 outline-none animate-pulse"
              placeholder="リスト数"
            />
          </div>
        )}
        {/* Buttons row */}
        <div className="flex justify-end items-center space-x-2">
          <button
            className={`bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded ${!canUpload ? " cursor-not-allowed" : ""}`}
            onClick={handleUpload}
            disabled={!canUpload}
          >
            アップロードする
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded"
            onClick={onClose}
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryUploadModal;