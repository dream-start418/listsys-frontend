"use client";

import React, { useState } from "react";
import LargeModal from "@/components/common/Loader/LargeModal";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataset: Dataset;
    current_condition: string;
    checkedCategories: { [key: string]: boolean };
    checkedItems: { [key: string]: { [key: string]: boolean } };
}

interface RequestGroup {
    category: string;
    options: string[];
}

interface Dataset {
    name: string;
    data: RequestGroup[];
}

const GroupCheckBox: React.FC<ModalProps> = ({ isOpen, onClose, dataset, current_condition, checkedCategories, checkedItems }) => {
    console.log("GroupCheckBox-dataset",  dataset);
    console.log("GroupCheckBox-checkedItems",  checkedItems);
    if (!isOpen || current_condition != dataset.name) return null;

    return (
        <div className="fixed inset-0 z-50 flex text-sm items-center justify-center bg-black bg-opacity-50 max-h-full overflow-auto no-scrollbar">
            <div className="relative bg-white rounded-lg shadow-lg p-6 pt-10 w-full max-w-7xl max-h-full overflow-auto no-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black hover:text-gray-300"
                >
                    ✖
                </button>
                <table className="w-full border-collapse border border-gray-700">
                    <tbody>
                        {dataset.data.map((item: RequestGroup, index: number) => (
                            <tr key={index} className="even:bg-white odd:bg-gray-200 text-black">
                                <td className="border border-gray-700 p-2 align-top min-w-16">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`category-${item.category}`}
                                            checked={checkedCategories[`${dataset.name}-${item.category}`] || false}
                                            className="form-checkbox text-blue-500 mr-2"
                                            readOnly
                                        />
                                        <label
                                            htmlFor={`category-${dataset.name}-${item.category}`}
                                            className="cursor-pointer"
                                        >
                                            {item.category}
                                        </label>
                                    </div>
                                </td>
                                <td className="border border-gray-700 p-2">
                                    <ul className="flex flex-wrap list-none">
                                        {item.options.map((option: string, idx: number) => (
                                            <li key={idx} className="flex items-center mx-4">
                                                <input
                                                    type="checkbox"
                                                    id={`${dataset.name}-${item.category}-${option}`}
                                                    checked={
                                                        checkedItems[`${dataset.name}-${item.category}`]?.[option] || false
                                                    }
                                                    className="form-checkbox text-blue-500"
                                                    readOnly
                                                />
                                                <label
                                                    htmlFor={`${dataset.name}-${item.category}-${option}`}
                                                    className="cursor-pointer ml-2"
                                                >
                                                    {option}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupCheckBox;