"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";
import DetailModalRed from "@/components/common/Loader/DetailModalRed";
import { requestGroupCheckData, requestGroupCheckData2, requestGroupCheckData3, requestGroupCheckData4, requestGroupCheckData5 } from "@/constant/RequestGroup";
import GroupCheckBox from "../NewRequest/GroupCheckBox/GroupCheckBox";
import DragDrop from "../common/DragDrop/DragDrop";
import { jwtDecode } from "jwt-decode";
import { request } from "http";
import NoMatchMarkingModal from "../NewRequest/NoMatchMarkingModal";

interface RequestList {
    id: number;
    requestRandId: string;
    category: string;
    projectName: string;
    wishNum: number;
    tags: string[];
    portalSite: string[];
    detailCondition: Record<string, any>;
    completeState: number;
    cancelState: number;
    areaSelection: Record<string, any>;
    workSelection: Record<string, any>;
    areaMemo: string
    mainCondition: Record<string, any>;
    subCondition: Record<string, any>;
    listCount: number;
    fileName: string;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
    requestAt: Date;
    deliveryAt: Date;
    user: User;
}

interface User {
    id: number;
    name: string;
    email: string;
    contractId: string;
}

interface DecodedToken {
    id: string; // Adjust the type based on your token structure
    exp?: number; // Token expiry timestamp
    iat?: number;
    role: number;
}

interface RequestGroupCheckData {
    category: string;
    options: string[];
}

interface RedListDeliveryTableProps {
    bigCategory: string;
    smallCategory: string;
    area: string;
    state: string;
    updatedDate: Date;
}

const RedListDeliveryTable = () => {
    const [requestLists, setRequestLists] = useState<RequestList[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ project_name: "" });
    const [selectedList, setSelectedList] = useState<RedListDeliveryTableProps | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [usersWithoutContracts, setUsersWithoutContracts] = useState<User[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isCheckBoxModalOpen, setIsCheckBoxModalOpen] = useState(false);
    const [currentCondition, setCurrentCondition] = useState("");
    const [redItems, setRedItems] = useState<RedListDeliveryTableProps[]>([]);
    const [isNoMatchModalOpen, setIsNoMatchModalOpen] = useState(false);
    const [stateFilter, setStateFilter] = useState<string>("all");

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem("listan_token");
            if (!token) {
                console.log("No token found. Redirecting to login...");
                return;
            }

            const decodedToken = jwtDecode<DecodedToken>(token);
            const userId = decodedToken?.id;

            if (!userId) {
                console.log("Invalid token: userId not found.");
                // Handle token validation failure
                return;
            }
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/requestLists_red`,
                    {
                        params: { userId },
                        headers: { Authorization: `Bearer ${token}` }, // Optional: Pass token in the header
                    }
                );
                // console.log("Response from fetching requests:", response.data);
                const sortedRedItems = response.data.redItems.sort((a: RedListDeliveryTableProps, b: RedListDeliveryTableProps) => {
                    return new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();
                });
                setRedItems(sortedRedItems);

            } catch (error) {
                console.log("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleFileSelection = (files: FileList | null) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        console.log(file);
        if (!file) {
            alert("ファイルを選択してください。");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-red-file`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("File uploaded successfully:", response.data);
            if(response.status === 200) {
                alert("ファイルのアップロードが完了しました。\n 挿入済み: " + response.data.inserted + "\n 重複したデータ: " + response.data.duplicatesSkipped + "\n 無効なデータ: " + response.data.invalidSkipped + "\n 該当なしデータ: " + response.data.noMatchItems);
            }
            //page reload
            location.reload();
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }
    const openDetailModal = (redItem: RedListDeliveryTableProps) => {
        setSelectedList(redItem);
        setIsDetailModalOpen(true);
    };

    // Filter redItems based on selected state
    const filteredRedItems = redItems.filter(redItem => {
        if (stateFilter === "all") return true;
        return redItem.state === stateFilter;
    });

    // Get unique states for filter options
    const uniqueStates = {
        "登録済み": "登録済み",
        "該当なし": "該当なし",
        "未登録": "未登録",
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="rounded-sm border border-gray-500 mx-4 px-6 pb-2.5 pt-6 shadow-default bg-white">
                <div className="flex justify-between items-center gap-4">
                    <DragDrop 
                        onFileUpload={handleFileUpload} 
                        onNoMatchClick={() => setIsNoMatchModalOpen(true)}
                    />
                    
                    {/* State Filter */}
                    <div className="mb-4 flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">状況でフィルター:</label>
                        <select
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">すべて</option>
                            {Object.keys(uniqueStates).map((state: string) => (
                                <option key={state} value={state}>
                                    {uniqueStates[state as keyof typeof uniqueStates]}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-500">
                            {filteredRedItems.length}件中{redItems.length}件表示
                        </span>
                    </div>
                </div>
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left">
                                <th className="min-w-[40px] px-4 py-4 font-medium text-black">No</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">大カテゴリ</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">小カテゴリ</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">エリア</th>
                                {/* <th className="min-w-[120px] px-4 py-4 font-medium text-black">リスト数</th> */}
                                {/* <th className="px-4 py-4 font-medium text-black">リスト区分</th> */}
                                <th className="px-4 py-4 font-medium text-black">状況</th>
                                <th className="px-4 py-4 font-medium text-black">更新日</th>
                                <th className="px-4 py-4 font-medium text-black"> </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRedItems.map((redItem, index) => (
                                <tr key={index} className="border-b">
                                    <td className="border-b px-4 py-5 text-black">{index + 1}</td>
                                    <td className="border-b px-4 py-5 text-black">{redItem.bigCategory}</td>
                                    <td className="border-b px-4 py-5 text-black">{redItem.smallCategory}</td>
                                    <td className="border-b px-4 py-5 text-black">{redItem.area}</td>
                                    {/* <td className="border-b px-4 py-5 text-black">{requestList.listCount}</td> */}
                                    {/* <td className="border-b px-4 py-5 text-black">{requestList.category}</td> */}
                                    <td className={`border-b px-4 py-5 text-black ${redItem.state === "登録済み" ? "text-green-500" : redItem.state === "該当なし" ? "text-red-500" : "text-gray-500"}`}>
                                        {redItem.state}
                                    </td>
                                    <td className="border-b px-4 py-5 text-black">
                                        {redItem.updatedDate
                                            ? new Intl.DateTimeFormat("ja-JP", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }).format(new Date(redItem.updatedDate))
                                            : "N/A"}
                                    </td>
                                    {/* <td className="border-b px-4 py-5 text-white">
                                        <button
                                            className="text-blue-500 hover:underline mx-2"
                                            onClick={() => openDetailModal(redItem)}
                                        >
                                            詳細
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedList && (
                <DetailModalRed
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                >
                    <h2 className="text-lg font-bold mb-4 text-gray-700">詳細</h2>
                    <div>
                        <div className="flex py-2 justify-between items-center">
                            <label className="block text-gray-700 min-w-40">大カテゴリ</label>
                            <input
                                type="text"
                                value={selectedList.bigCategory}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex py-2 justify-between items-center">
                            <label className="block text-gray-700 min-w-40">小カテゴリ</label>
                            <input
                                type="text"
                                value={selectedList.smallCategory}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex py-2 justify-between items-center">
                            <label className="block text-gray-700 min-w-40">状況</label>
                            <input
                                type="text"
                                value={selectedList.state}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex py-2 justify-between items-center">
                            <label className="block text-gray-700 min-w-40">リスト数</label>
                            <input
                                type="number"
                                value={0}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex py-2 justify-between items-center">
                            <label className="block text-gray-700 min-w-40">更新日</label>
                            <input
                                type="text"
                                value={selectedList.updatedDate
                                    ? new Intl.DateTimeFormat("ja-JP", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }).format(new Date(selectedList.updatedDate))
                                    : "N/A"}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                    </div>
                </DetailModalRed>
            )}

            <NoMatchMarkingModal
                isOpen={isNoMatchModalOpen}
                onClose={() => setIsNoMatchModalOpen(false)}
                redItems={redItems}
                onUpdate={() => {
                    // Refresh the data
                    window.location.reload();
                }}
            />
        </>
    );
};

export default RedListDeliveryTable;
