import React, { useState } from 'react';

interface CategoryModalProps {
    onCloseCost: () => void;
    onUpdate: () => void;
    children: React.ReactNode;
    enableUpdate: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ children, onCloseCost, onUpdate, enableUpdate }) => {
    const [updateFlag, setUpdateFlag] = useState(false);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
                {children}
                
                <div className="flex justify-end space-x-4 mt-6">
                    {!updateFlag ? (
                        <button
                            onClick={() => {
                                setUpdateFlag(true);
                                enableUpdate();
                            }}
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        >
                            変更
                        </button>
                    ) : (
                        <button
                            onClick={onUpdate}
                            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                        >
                            保存
                        </button>
                    )}
                    <button
                        onClick={onCloseCost}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;