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
                alert("ファイルのアップロードが完了しました。");
                //page reload
                location.reload();
            } else {
                alert(response.data.message);
            }

        } catch (error) {
            console.error("Error uploading file:", error);
            alert("ファイルのアップロードに失敗しました。");
        } finally {
           () => {};
        }
    }
    const openDetailModal = (redItem: RedListDeliveryTableProps) => {
        setSelectedList(redItem);
        setIsDetailModalOpen(true);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="rounded-sm border border-gray-500 mx-4 px-6 pb-2.5 pt-6 shadow-default bg-white">
                <DragDrop onFileUpload={handleFileUpload} />
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
                            {redItems.map((redItem, index) => (
                                <tr key={index} className="border-b">
                                    <td className="border-b px-4 py-5 text-black">{index + 1}</td>
                                    <td className="border-b px-4 py-5 text-black">{redItem.bigCategory}</td>
                                    <td className="border-b px-4 py-5 text-black">{redItem.smallCategory}</td>
                                    <td className="border-b px-4 py-5 text-black">{redItem.area}</td>
                                    {/* <td className="border-b px-4 py-5 text-black">{requestList.listCount}</td> */}
                                    {/* <td className="border-b px-4 py-5 text-black">{requestList.category}</td> */}
                                    <td className="border-b px-4 py-5 text-black">{redItem.state}</td>
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
        </>
    );
};

export default RedListDeliveryTable;
