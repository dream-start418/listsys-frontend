"use client";

import React, { useState, useEffect } from "react";
import { requestGroupCheckData, requestGroupCheckData3, requestGroupCheckData5 } from "@/constant/RequestGroup";
import ExtraModal from "../common/Loader/ExtraModal";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface RequestGroup {
    category: string;
    options: string[];
}

interface DecodedToken {
    id: string;
    exp?: number;
    iat?: number;
    role: number;
}

interface RedListDeliveryTableProps {
    bigCategory: string;
    smallCategory: string;
    area: string;
    state: string;
    updatedDate: Date;
}

interface NoMatchMarkingModalProps {
    isOpen: boolean;
    onClose: () => void;
    redItems: RedListDeliveryTableProps[];
    onUpdate: () => void;
}

const NoMatchMarkingModal: React.FC<NoMatchMarkingModalProps> = ({
    isOpen,
    onClose,
    redItems,
    onUpdate
}) => {
    // State for dropdown selections
    const [selectedBigCategory, setSelectedBigCategory] = useState<string>("");
    const [selectedSmallCategory, setSelectedSmallCategory] = useState<string>("");
    const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");

    // State for available options based on selections
    const [availableSmallCategories, setAvailableSmallCategories] = useState<string[]>([]);
    const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([]);

    // Get all big categories from requestGroupCheckData
    const bigCategories = requestGroupCheckData5.map(item => item.category);
    
    // Get all small categories from requestGroupCheckData5
    const allSmallCategories = requestGroupCheckData5.flatMap(item => item.options);
    
    // Get all prefectures from requestGroupCheckData3
    const allPrefectures = requestGroupCheckData3[0].options;

    // Filter available small categories based on current redItems
    useEffect(() => {
        if (isOpen && redItems) {
            // const selectableSmallCategories = allSmallCategories.filter(option => 
            //     redItems.some(item => 
            //         item.smallCategory === option && (item.state === "未登録" || item.state === "該当なし")
            //     )
            // );
            const selectableSmallCategories = allSmallCategories;
            setAvailableSmallCategories(selectableSmallCategories);
        }
    }, [isOpen, redItems]);

    // Filter available prefectures based on current redItems
    useEffect(() => {
        if (isOpen && redItems) {
            // const selectablePrefectures = allPrefectures.filter(option => 
            //     redItems.some(item => 
            //         item.area === option && (item.state === "未登録" || item.state === "該当なし")
            //     )
            // );
            const selectablePrefectures = allPrefectures;
            setAvailablePrefectures(selectablePrefectures);
        }
    }, [isOpen, redItems]);

    // Reset selections when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedBigCategory("");
            setSelectedSmallCategory("");
            setSelectedPrefecture("");
        }
    }, [isOpen]);

    // Check if an item is selectable (未登録 or 該当なし)
    const isItemSelectable = (option: string, type: 'smallCategory' | 'prefecture') => {
        if (type === 'smallCategory') {
            return redItems.some(item => 
                item.smallCategory === option && (item.state === "未登録" || item.state === "該当なし")
            );
        } else {
            return redItems.some(item => 
                item.area === option && (item.state === "未登録" || item.state === "該当なし")
            );
        }
    };

    // Handle registration (登録) - equivalent to selecting items and clicking "変更"
    const handleRegister = async () => {
        const token = localStorage.getItem('listan_token');
        if (!token) {
            alert('ユーザーは認証されていません。ログインしてください。');
            return;
        }

        if (!selectedBigCategory || !selectedSmallCategory || !selectedPrefecture) {
            alert('すべての項目を選択してください。');
            return;
        }

        try {
            // Mark selected items as 該当なし
            const workSelection = {
                [selectedBigCategory]: [selectedSmallCategory]
            };
            const areaSelection = {
                "都道府県": [selectedPrefecture]
            };

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/update_red_item_status`, {
                workSelection,
                areaSelection,
                status: "該当なし",
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('response', response);

            if (response.status === 200) {
                const results = response?.data?.results || [];
                const successCount = results.filter((r: any) => r.action === "marked_as_no_match").length;
                const errorCount = results.filter((r: any) => r.action === "already_exists").length;
                const alreadyRedRecordCount = results.filter((r: any) => r.action === "already_red_record").length;
                if (alreadyRedRecordCount > 0) {
                    alert('既に登録済みのリストがあります。');
                    // onClose();
                } else if (successCount > 0) {
                    alert('該当なしとして登録しました。');
                    onUpdate();
                    onClose();
                } else if (errorCount > 0) {
                    alert('既に登録済みです');
                    // onClose();
                }
            } else {
                alert('更新に失敗しました。');
                onClose();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('更新に失敗しました。');
        }
    };

    // Handle removal (解除) - equivalent to deselecting items and clicking "変更"
    const handleRemove = async () => {
        const token = localStorage.getItem('listan_token');
        if (!token) {
            alert('ユーザーは認証されていません。ログインしてください。');
            return;
        }

        if (!selectedBigCategory || !selectedSmallCategory || !selectedPrefecture) {
            alert('すべての項目を選択してください。');
            return;
        }

        try {
            // Mark selected items as 未登録
            const workSelection = {
                [selectedBigCategory]: [selectedSmallCategory]
            };
            const areaSelection = {
                "都道府県": [selectedPrefecture]
            };

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/update_red_item_status`, {
                workSelection,
                areaSelection,
                status: "未登録",
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                const results = response?.data?.results || [];
                const successCount = results.filter((r: any) => r.action === "marked_as_unregistered").length;
                const notFoundCount = results.filter((r: any) => r.action === "not_found").length;
                const errorCount = results.filter((r: any) => r.action === "error").length;
                
                if (successCount > 0) {
                    alert(`未登録に戻しました。`);
                    onUpdate();
                    onClose();
                } else if (notFoundCount > 0 && errorCount === 0) {
                    alert('解除するリストがありません。');
                } else if (errorCount > 0) {
                    alert('更新に失敗しました。');
                } else {
                    alert('更新に失敗しました。');
                    onClose();
                }
            }

            // alert('未登録に戻しました。');
            // onUpdate();
            // onClose();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('更新に失敗しました。');
        }
    };

    if (!isOpen) return null;

    return (
        <ExtraModal isOpen={isOpen} onClose={onClose}>
            <div className="space-y-6 w-full text-black">
                <h2 className="text-xl font-bold mb-4 text-center">該当なし登録</h2>
                
                <div className="space-y-4">
                    {/* 大カテゴリー Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            大カテゴリー
                        </label>
                        <select
                            value={selectedBigCategory}
                            onChange={(e) => setSelectedBigCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">選択してください</option>
                            {bigCategories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 小カテゴリー Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            小カテゴリー
                        </label>
                        <select
                            value={selectedSmallCategory}
                            onChange={(e) => setSelectedSmallCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={availableSmallCategories.length === 0}
                        >
                            <option value="">選択してください</option>
                            {availableSmallCategories.map((category, index) => (
                                <option 
                                    key={index} 
                                    value={category}
                                    // disabled={!isItemSelectable(category, 'smallCategory')}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>
                        {availableSmallCategories.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                選択可能な小カテゴリーがありません
                            </p>
                        )}
                    </div>

                    {/* 都道府県 Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            都道府県
                        </label>
                        <select
                            value={selectedPrefecture}
                            onChange={(e) => setSelectedPrefecture(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={availablePrefectures.length === 0}
                        >
                            <option value="">選択してください</option>
                            {availablePrefectures.map((prefecture, index) => (
                                <option 
                                    key={index} 
                                    value={prefecture}
                                    // disabled={!isItemSelectable(prefecture, 'prefecture')}
                                >
                                    {prefecture}
                                </option>
                            ))}
                        </select>
                        {availablePrefectures.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                選択可能な都道府県がありません
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleRemove}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                        disabled={!selectedBigCategory || !selectedSmallCategory || !selectedPrefecture}
                    >
                        解除
                    </button>
                    <button
                        onClick={handleRegister}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        disabled={!selectedBigCategory || !selectedSmallCategory || !selectedPrefecture}
                    >
                        登録
                    </button>
                </div>
            </div>
        </ExtraModal>
    );
};

export default NoMatchMarkingModal;
