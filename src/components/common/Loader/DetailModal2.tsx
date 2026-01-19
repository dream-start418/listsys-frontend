"use client";
import React from "react";
import { useState } from "react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  onChangeFlag: (flag: boolean) => void;
  deleteFlag: boolean;
  downloadFlag: boolean
  onDownloadList: () => void;
  onEdit: () => void;
  onEditMonth: () => void;
  editFlag: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, children, onSave, onChangeFlag, onDelete, deleteFlag, onEdit, editFlag, onEditMonth }) => {
  if (!isOpen) return null;
  const [changeFlag, setChangeFlag] = useState(false);
  const handleToggleChangeFlag = (flag: boolean) => {
    setChangeFlag(flag);
    onChangeFlag(flag); // Notify the parent
  };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-20">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        {children}
        <div className="flex justify-between my-2">
          <div>
            {deleteFlag && (
              <button
                onClick={() => {
                  onDelete();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hidden"
              >
                削除
              </button>
            )}
          </div>
          <div
            className="ml-2 flex justify-center">
            {editFlag && (
              <div className="flex justify-center">
                <button
                  onClick={onEdit}
                  className="bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 mr-4"
                >
                  納品集計
                </button>
                <button
                  onClick={onEditMonth}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-8"
                >
                  月別集計
                </button>
              </div>
            )}
            {deleteFlag && (
              !changeFlag ? (
                <button
                  onClick={() => handleToggleChangeFlag(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  変更
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleToggleChangeFlag(false);
                    onSave();
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  保存
                </button>
              )
            )}
            <button
              onClick={onClose}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
