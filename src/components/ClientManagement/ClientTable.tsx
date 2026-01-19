"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Loader/Modal";
import DetailModal from "@/components/common/Loader/DetailModal2";
import CategoryModal from '@/components/common/Loader/CategoryModal';
import { jwtDecode } from "jwt-decode";
import MonthEditModal from "@/components/common/Loader/MonthEditModal";

interface Client {
    id: number;
    name: string;
    contractId: string;
    listCount: number;
    contactAddress: string;
    requestCount: number;
    memo: string;
    updatedAt: Date;
    createdAt: Date;
    user: User;
}

interface User {
    createdAt: Date;
    id: number;
    name: string;
    email: string;
    phone: string;
    planId: number;
    contractId: string;
    requests: RequestList[];
    requestsBlue: RequestList[];
    requestsGreen: RequestList[];
    requestsYellow: RequestList[];
    requestsPink: RequestList[];
    requestsRed: RequestList[];
    clientCost: ClientCost;
}

interface RequestList {
    id: number;
    requestRandId: string;
    projectName: string;
    completeState: number;
    areaSelection: string;
    areaMemo: string
    mainCondition: Record<string, any>;
    subCondition: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    filePath: string;
    fileName: string;
    listCount: number;
    user: User;
}

interface ClientCost {
    userId: number;
    red_price: number;
    blue_price: number;
    green_price: number;
    yellow_price: number;
    pink_price: number;   
}



const ClientTable = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddModalOpen2, setIsAddModalOpen2] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ id: "" });
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [usersWithoutContracts, setUsersWithoutContracts] = useState<User[]>([]);
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [deleveryEditModal, setDeleveryEditModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientCost, setClientCost] = useState<ClientCost | null>({
        userId: 0,
        red_price: -1,
        blue_price: -1,
        green_price: -1,
        yellow_price: -1,
        pink_price: -1
    });
    const [isCostReadOnly, setIsCostReadOnly] = useState(true);
    const [monthTarget, setMonthTarget] = useState<Date>(new Date());
    const [isMonthEditModalOpen, setIsMonthEditModalOpen] = useState(false);
    const [monthData, setMonthData] = useState<any>(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`);
                const sortedClients = response.data.clients.sort((a: Client, b: Client) => {
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                });
                setClients(sortedClients);
                setUsersWithoutContracts(response.data.usersWithoutContracts);
            } catch (error) {
                console.log("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const handleChangeFlag = (flag: boolean) => {
        setIsReadOnly(!flag); // Update read-only based on flag
    };

    const handleAddClient = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/add_client`, newClient);
            setClients(response.data.clients);
            setNewClient({ id: "" });
            setIsAddModalOpen(false);
        } catch (error) {
            console.log("Error adding client:", error);
        }
    };

    const handleMakeClient = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/make_client`, { user_name: newUserName, user_email: newUserEmail });
            setClients(response.data.clients);
            setNewUserName("");
            setNewUserEmail("");
            setIsAddModalOpen2(false);
        } catch (error) {
            console.log("Error adding client:", error);
        }
    };

    const handleSaveSelectedClient = async () => {
        if (!selectedClient) return;

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/update_client/${selectedClient.id}`, selectedClient);
            setClients((prev) =>
                prev.map((client) => (client.id === selectedClient.id ? selectedClient : client))
            );
            setIsDetailModalOpen(false);
            setSelectedClient(null);
        } catch (error) {
            console.log("Error updating client:", error);
        }
    };

    const openDetailModal = (client: Client) => {
        setSelectedClient(client);
        setClientCost(client?.user?.clientCost ? client.user.clientCost : {
            userId: client.user?.id,
            red_price: -1,
            blue_price: -1,
            green_price: -1,
            yellow_price: -1,
            pink_price: -1
        });
        setIsDetailModalOpen(true);
    };

    const handleDeleveryEdit = () => {
        setDeleveryEditModal(true);
    }

    const handleCloseModal = () => {
        setDeleveryEditModal(false);
        setIsCostReadOnly(true);
    };

    const handleUpdate = async () => {
        const token = localStorage.getItem('listan_token');
        if (!token) return;
        const decoded = jwtDecode(token) as { role?: number };

        if (!decoded.role || decoded.role < 1) {
            alert('管理者権限が必要です');
            return;
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/update_client_cost`, 
            clientCost,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('listan_token')}`,
                }
            }
        );
        console.log(clientCost);
        // const response =await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/update_client_cost`, clientCost);
        if(response.status === 200){    
            setIsCostReadOnly(true);
            setDeleveryEditModal(false);
            alert("更新しました");
        } else {
            alert("更新に失敗しました");
        }
    };

    const enableUpdate = () => {
        setIsCostReadOnly(false);
    }

    const getMonthData = async (date: Date) => {
        const monthTarget = new Date(date);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/clients_month`, {
            monthTarget: monthTarget,
            userId: selectedClient?.user?.id,
        });

        const getedRequest = response.data;
        setMonthData(getedRequest);
        console.log(monthData);
    }
    const handleEditMonth = async () => {
        console.log(monthTarget);
        await getMonthData(monthTarget);
        console.log(monthData);
        setIsMonthEditModalOpen(true);
    }

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="bg-white px-4 py-8">
            {/* <button
                className="m-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setIsAddModalOpen(true)}
            >
                新規登録2
            </button> */}
            <button
                className="m-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setIsAddModalOpen2(true)}
            >
                新規登録
            </button>
            <div className="rounded-sm border border-stroke px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-300 text-left">
                                <th className="min-w-[40px] px-4 py-4 font-medium text-black">No</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">契約ID</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">クライアント名</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">契約プラン</th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-black">合計リスト数</th>
                                <th className="px-4 py-4 font-medium text-black">合計依頼数</th>
                                <th className="px-4 py-4 font-medium text-black">更新日</th>
                                <th className="px-4 py-4 font-medium text-black"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client, index) => {
                                const countSum =
                                    (client.user?.requests?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                                    +(client.user?.requestsBlue?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                                    +(client.user?.requestsGreen?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                                    +(client.user?.requestsYellow?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                                    +(client.user?.requestsPink?.reduce((sum, item) => sum + item.listCount, 0) || 0);
                                const count_request = (client.user?.requests?.length || 0) + (client.user?.requestsBlue?.length || 0) + (client.user?.requestsGreen?.length || 0) + (client.user?.requestsYellow?.length || 0) + (client.user?.requestsPink?.length || 0) + (client.user?.requestsRed?.length || 0);

                                return (
                                    <tr key={client.id}>
                                        <td className="border-b border-[#eee] px-4 py-5">{index + 1}</td>
                                        <td className="border-b border-[#eee] px-4 py-5">{client.contractId}</td>
                                        <td className="border-b border-[#eee] px-4 py-5">{(client.user) ? client.user.name : ""}</td>
                                        <td className="border-b border-[#eee] px-4 py-5">
                                            {(client.user?.planId == 0) ? "フリー" : "レギュラー"}
                                        </td>
                                        <td className="border-b border-[#eee] px-4 py-5">{countSum}</td>
                                        <td className="border-b border-[#eee] px-4 py-5">{count_request}</td>
                                        <td className="border-b border-[#eee] px-4 py-5">
                                            {client.updatedAt
                                                ? new Intl.DateTimeFormat("ja-JP", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }).format(new Date(client.updatedAt))
                                                : "N/A"}
                                        </td>
                                        <td className="border-b px-4 py-5 text-white">
                                            <button
                                                className="text-blue-500 hover:underline"
                                                onClick={() => openDetailModal(client)}
                                            >
                                                詳細
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Client Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <h2 className="text-lg font-bold mb-4 text-gray-700">新規クライアント登録</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700">クライアント名</label>
                        <div className="relative z-20 bg-gray-200">
                            <select
                                value={selectedOption}
                                onChange={(e) => {
                                    setSelectedOption(e.target.value);
                                    setNewClient({ id: e.target.value })
                                }}
                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary text-gray-900"
                            >
                                <option key="user_select_0" value="" disabled className="text-body text-gray-900">
                                    ユーザーを選択してください。
                                </option>
                                {usersWithoutContracts.map((user, index) => (
                                    <option
                                        key={`user_select_${index}`}
                                        value={user.id}
                                        className="text-body text-black"
                                    >
                                        {user.name}___{user.email}
                                    </option>
                                ))}
                            </select>

                            <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                                <svg
                                    className="fill-current"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.8">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill=""
                                        ></path>
                                    </g>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddClient}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            登録する
                        </button>
                    </div>
                </div>
            </Modal>
            {/* Add Client Modal2 */}
            <Modal isOpen={isAddModalOpen2} onClose={() => setIsAddModalOpen2(false)}>
                <h2 className="text-lg font-bold mb-4 text-gray-700">新規クライアント登録</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700">クライアント名</label>
                        <input
                            type="text"
                            value={newUserName}
                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                            onChange={(e) => { setNewUserName(e.target.value) }}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">メールアドレス</label>
                        <input
                            type="email"
                            value={newUserEmail}
                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                            onChange={(e) => { setNewUserEmail(e.target.value) }}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleMakeClient}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            登録する
                        </button>
                    </div>
                </div>
            </Modal>
            {deleveryEditModal && (
                <CategoryModal
                    onCloseCost={handleCloseModal}
                    onUpdate={handleUpdate}
                    enableUpdate={enableUpdate}
                >
                    {(() => {
                        const countSum =
                            (selectedClient?.user?.requests?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient?.user?.requestsBlue?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient?.user?.requestsGreen?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient?.user?.requestsYellow?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient?.user?.requestsPink?.reduce((sum, item) => sum + item.listCount, 0) || 0);
                        const count_request = (selectedClient?.user?.requests?.length || 0) + (selectedClient?.user?.requestsBlue?.length || 0) + (selectedClient?.user?.requestsGreen?.length || 0) + (selectedClient?.user?.requestsYellow?.length || 0) + (selectedClient?.user?.requestsPink?.length || 0) + (selectedClient?.user?.requestsRed?.length || 0);
                                
                        return (
                                    <>
                                        <div className="max-w-full overflow-x-auto">
                                            <table className="w-full table-auto">
                                                <thead>
                                                    <tr>
                                                        <th className="min-w-[120px] px-4 py-2 font-medium text-black"></th>
                                                        <th className="min-w-[120px] px-4 py-2 font-medium text-black">単価</th>
                                                        <th className="px-4 py-2 font-medium text-black">リスト数</th>
                                                        <th className="px-4 py-2 font-medium text-black">依頼数</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <div className="bg-red-500 text-white px-4 py-2 rounded">レッド</div>
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <input type="text" 
                                                            className={`max-w-[110px] border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isCostReadOnly ? 'bg-gray-200' : 'bg-white'} text-sm`}
                                                            value={(clientCost?.red_price === undefined || clientCost?.red_price < 0) ? "お問い合わせ" : clientCost.red_price} 
                                                            disabled = {isCostReadOnly}
                                                            onChange={(e) => {
                                                                if(e.target.value == '0') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        red_price: 0
                                                                    } : null);
                                                                } else if (e.target.value == '') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        red_price: -1,
                                                                    } : null);
                                                                } else {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        red_price: Number(e.target.value)
                                                                    } : null);
                                                                }
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.select();
                                                            }}
                                                            />
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            -
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsRed?.length || 0}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <div className="bg-blue-500 text-white px-4 py-2 rounded">ブルー</div>
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <input type="text" 
                                                            className={`max-w-[110px] border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isCostReadOnly ? 'bg-gray-200' : 'bg-white'} text-sm`}
                                                            value={(clientCost?.blue_price === undefined || clientCost?.blue_price < 0) ? "お問い合わせ" : clientCost.blue_price} 
                                                            disabled = {isCostReadOnly}
                                                            onChange={(e) => {
                                                                if(e.target.value == '0') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        blue_price: 0
                                                                    } : null);
                                                                } else if (e.target.value == '') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        blue_price: -1,
                                                                    } : null);
                                                                } else {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        blue_price: Number(e.target.value)
                                                                    } : null);
                                                                }
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.select();
                                                            }}
                                                            />
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsBlue?.reduce((sum, item) => sum + item.listCount, 0) || 0}
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsBlue?.length || 0}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <div className="bg-green-500 text-white px-4 py-2 rounded">グリーン</div>
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <input type="text" 
                                                            className={`max-w-[110px] border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isCostReadOnly ? 'bg-gray-200' : 'bg-white'} text-sm`}
                                                            value={(clientCost?.green_price === undefined || clientCost?.green_price < 0) ? "お問い合わせ" : clientCost.green_price} 
                                                            disabled = {isCostReadOnly}
                                                                onChange={(e) => {
                                                                if(e.target.value == '0') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        green_price: 0
                                                                    } : null);
                                                                } else if (e.target.value == '') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        green_price: -1,
                                                                    } : null);
                                                                } else {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        green_price: Number(e.target.value)
                                                                    } : null);
                                                                }
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.select();
                                                            }}
                                                            />
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsGreen?.reduce((sum, item) => sum + item.listCount, 0) || 0}
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsGreen?.length || 0}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <div className="bg-yellow-400 text-white px-4 py-2 rounded">イエロー</div>
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <input type="text" 
                                                            className={`max-w-[110px] border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isCostReadOnly ? 'bg-gray-200' : 'bg-white'} text-sm`}
                                                            value={(clientCost?.yellow_price === undefined || clientCost?.yellow_price < 0) ? "お問い合わせ" : clientCost.yellow_price} 
                                                            disabled = {isCostReadOnly}
                                                                onChange={(e) => {
                                                                if(e.target.value == '0') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        yellow_price: 0
                                                                    } : null);
                                                                } else if (e.target.value == '') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        yellow_price: -1,
                                                                    } : null);
                                                                } else {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        yellow_price: Number(e.target.value)
                                                                    } : null);
                                                                }
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.select();
                                                            }}
                                                            />
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsYellow?.reduce((sum, item) => sum + item.listCount, 0) || 0}
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsYellow?.length || 0}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <div className="bg-pink-500 text-white px-4 py-2 rounded">ピンク</div>
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <input type="text" 
                                                            className={`max-w-[110px] border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isCostReadOnly ? 'bg-gray-200' : 'bg-white'} text-sm`}
                                                            value={(clientCost?.pink_price === undefined || clientCost?.pink_price < 0) ? "お問い合わせ" : clientCost.pink_price} 
                                                            disabled = {isCostReadOnly}
                                                                onChange={(e) => {
                                                                if(e.target.value == '0') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        pink_price: 0
                                                                    } : null);
                                                                } else if (e.target.value == '') {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        pink_price: -1,
                                                                    } : null);
                                                                } else {
                                                                    setClientCost(clientCost ? {
                                                                        ...clientCost,
                                                                        pink_price: Number(e.target.value)
                                                                    } : null);
                                                                }
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.select();
                                                            }}
                                                            />
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsPink?.reduce((sum, item) => sum + item.listCount, 0) || 0}
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {selectedClient?.user?.requestsPink?.length || 0}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            <div className="px-4 py-2 rounded">合計
                                                            </div>
                                                        </td>
                                                        <td></td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {countSum}
                                                        </td>
                                                        <td className="border-b border-[#eee] px-4 py-2 text-center">
                                                            {count_request}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                        )
                    })()}
                </CategoryModal>
            )}
            {/* Detail Modal */}
            {selectedClient && (
                <DetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => {setIsDetailModalOpen(false); handleChangeFlag(false)}}
                    onSave={handleSaveSelectedClient}
                    onChangeFlag={handleChangeFlag}
                    onDelete={() => {}}
                    onDownloadList={() => {}}
                    deleteFlag= {true}
                    downloadFlag= {false}
                    onEdit={handleDeleveryEdit}
                    editFlag= {selectedClient.user?.planId !== 0}
                    onEditMonth={handleEditMonth}
                >

                    {(() => {
                        const countSum =
                            (selectedClient.user?.requests?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient.user?.requestsBlue?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient.user?.requestsGreen?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient.user?.requestsYellow?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient.user?.requestsPink?.reduce((sum, item) => sum + item.listCount, 0) || 0)
                            +(selectedClient.user?.requestsRed?.reduce((sum, item) => sum + item.listCount, 0) || 0);
                        const count_request = (selectedClient.user?.requests?.length || 0) + (selectedClient.user?.requestsBlue?.length || 0) + (selectedClient.user?.requestsGreen?.length || 0) + (selectedClient.user?.requestsYellow?.length || 0) + (selectedClient.user?.requestsPink?.length || 0) + (selectedClient.user?.requestsRed?.length || 0);

                        return (
                            <>
                                <h2 className="text-lg font-bold mb-4 text-gray-700">クライアント詳細</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700">契約ID</label>
                                        <input
                                            type="text"
                                            value={selectedClient.user?.contractId || ""}
                                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 bg-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">契約プラン</label>
                                        <select 
                                            value={selectedClient.user?.planId}
                                            className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isReadOnly ? "bg-gray-200" : ""}`}
                                            onChange={(e) => {
                                                setSelectedClient((prev) => {
                                                    if (!prev) return null;
                                                    return {
                                                        ...prev,
                                                        user: {
                                                            ...prev.user,
                                                            planId: Number(e.target.value),
                                                        }
                                                    };
                                                });
                                            }}  
                                            disabled={isReadOnly}
                                        >
                                            <option value={0}>フリー</option>
                                            <option value={1}>レギュラー</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">契約メールアドレス</label>
                                        <input
                                            type="text"
                                            value={selectedClient.user?.email || ""}
                                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 bg-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">クライアント名</label>
                                        <input
                                            type="text"
                                            value={selectedClient.user?.name || ""}
                                            onChange={(e) =>
                                                setSelectedClient((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            user: {
                                                                ...prev.user,
                                                                name: e.target.value,
                                                            },
                                                        }
                                                        : null
                                                )
                                            }
                                            className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isReadOnly ? "bg-gray-200" : ""}`}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">連絡先電話番号</label>
                                        <input
                                            type="text"
                                            value={selectedClient.user?.phone || ""}
                                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 bg-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">リスト数</label>
                                        <input
                                            type="number"
                                            value={countSum}
                                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 bg-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">依頼数</label>
                                        <input
                                            type="number"
                                            value={count_request}
                                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 bg-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">更新日</label>
                                        <input
                                            type="text"
                                            value={
                                                selectedClient.updatedAt
                                                    ? new Intl.DateTimeFormat("ja-JP", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }).format(new Date(selectedClient.updatedAt))
                                                    : "N/A"
                                            }
                                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 bg-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">利用開始日</label>
                                        <input
                                            type="text"
                                            value={
                                                selectedClient.createdAt
                                                    ? new Intl.DateTimeFormat("ja-JP", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }).format(new Date(selectedClient.user?.createdAt))
                                                    : "N/A"
                                            }
                                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 bg-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">メモ</label>
                                        <textarea
                                            className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 ${isReadOnly ? "bg-gray-200" : ""}`}
                                            onChange={(e) =>
                                                setSelectedClient((prev) =>
                                                    prev ? { ...prev, memo: e.target.value } : null
                                                )
                                            }
                                            value={selectedClient.memo || ""}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DetailModal>
            )}
            {isMonthEditModalOpen && (
                <MonthEditModal
                    onClose={() => setIsMonthEditModalOpen(false)}
                    monthTarget={monthTarget}
                    setMonthTarget={setMonthTarget}
                    getMonthData={getMonthData}
                    monthData={monthData}
                />
            )}
        </div>
    );
};

export default ClientTable;