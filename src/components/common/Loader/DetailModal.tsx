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
  downloadFlag: boolean;
  onDownloadList: () => void;
  showDeliveryButton?: boolean;
  onDeliveryClick?: () => void;
  showCancelButton?: boolean;
  onCancelClick?: () => void;
  isCancelDisabled?: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, children, onSave, onChangeFlag, onDelete, deleteFlag, onDownloadList, downloadFlag, showDeliveryButton, onDeliveryClick, showCancelButton, onCancelClick, isCancelDisabled }) => {
  if (!isOpen) return null;
  const [changeFlag, setChangeFlag] = useState(false);
  const handleToggleChangeFlag = (flag: boolean) => {
    // setChangeFlag(flag);
    onChangeFlag(flag); // Notify the parent
  };
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
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
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                削除
              </button>
            )}
          </div>
          <div>
            {downloadFlag ? (
              <button
                className="ml-2 bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
                onClick={onDownloadList}
              >
                リストダウンロード
              </button>
            ) : (
              <button
                className="ml-2 bg-gray-500 text-white px-2 py-2 rounded hover:bg-gray-600"
              >
                リストダウンロード
              </button>
            )}
          </div>
          <div className="ml-2">
            {showCancelButton && (
              <button
                className={`mr-2 ${isCancelDisabled ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white px-4 py-2 rounded`}
                onClick={onCancelClick}
                disabled={isCancelDisabled}
              >
                キャンセル
              </button>
            )}
            {showDeliveryButton && (
              <button
                className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                onClick={onDeliveryClick}
              >
                納品
              </button>
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
