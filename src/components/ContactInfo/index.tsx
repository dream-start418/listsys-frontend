"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";
// import { jwtDecode } from "jwt-decode";

interface User {
    id: number;
    contractId: string;
    name: string;
    email: string;
    planId: number;
    listCount: number;
    requestCount: number;
    createdAt: Date;
    requests: RequestList[]
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


const FormLayout = () => {
    const [user, setUser] = useState<User>()
    const [loading, setLoading] = useState(true);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [changePass, setChangePass] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("listan_token");
            if (!token) {
                console.error("Token not found.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` }, // Add token to the header
                });
                setUser(response.data);
            } catch (error) {
                console.log("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSavePassword = async () => {
        if (!changePass || changePass == "" || changePass.length < 8) {
            alert("パスワードは8文字以上で入力してください。");
            return;
        }
        const token = localStorage.getItem("listan_token");
        if (!token) {
            console.error("Token not found.");
            setLoading(false);
            return;
        }
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/update_user_pass`, {
                changePass,
                headers: { Authorization: `Bearer ${token}` },
            });
            setChangePass("")
        } catch (error) {
            console.log("Error updating client:", error);
        }
    };


    const handleChangeFlag = (flag: boolean) => {
        setIsReadOnly(!flag); // Update read-only based on flag
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9">
                    {(() => {
                        const countSum =
                            user?.requests?.reduce((sum, item) => sum + item.listCount, 0) || 0;
                        const count_request = user?.requests?.length || 0;

                        return (
                            <>
                                <div className="rounded-sm border shadow-default border-gray-500 bg-white">
                                    <div className="border-b border-stroke px-6 py-4  border-gray-400">
                                        <h3 className="font-medium text-black">
                                            契約情報
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <label className="mb-3 block text-sm font-medium text-black">
                                                契約ID
                                            </label>
                                            <input
                                                type="text"
                                                placeholder=""
                                                value={(user?.contractId) ? user?.contractId : " "}
                                                className="w-full rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary bg-gray-200"
                                                readOnly
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="mb-3 block text-sm font-medium text-black">
                                                契約プラン
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder=""
                                                value={(user?.planId === 0) ? "フリー" : "レギュラー"}
                                                className="w-full rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary bg-gray-200"
                                                readOnly
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="mb-3 block text-sm font-medium text-black">
                                                利用開始日
                                            </label>
                                            <input
                                                type="text"
                                                placeholder=""
                                                value={user?.createdAt
                                                    ? new Intl.DateTimeFormat("ja-JP", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }).format(new Date(user?.createdAt))
                                                    : "N/A"}
                                                className="w-full rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary bg-gray-200"
                                                readOnly
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="mb-3 block text-sm font-medium text-black">
                                                契約メールアドレス <span className="text-meta-1">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder=""
                                                value={user?.email}
                                                className="w-full rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary bg-gray-200"
                                                readOnly
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="mb-3 block text-sm font-medium text-black">
                                                パスワード <span className="text-meta-1">*</span>
                                            </label>
                                            {(isReadOnly) ? (
                                                <div className="flex">
                                                    <input
                                                        type="password"
                                                        placeholder="●●●●●●●●●●●"
                                                        className="w-full max-w-[330px] rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary bg-gray-200"
                                                        readOnly={isReadOnly}
                                                    />
                                                    <span>
                                                        <button
                                                            className="ml-4 w-20 h-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                            onClick={() => handleChangeFlag(true)}
                                                        >
                                                            変更
                                                        </button>
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex">
                                                    <input
                                                        type="password"
                                                        placeholder=""
                                                        className="w-full max-w-[300px] rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary "
                                                        onChange={(e) => {
                                                            setChangePass(e.target.value)
                                                        }}
                                                        readOnly={isReadOnly}
                                                    />
                                                    <span>
                                                        <button
                                                            className="ml-4 w-20 h-full bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
                                                            onClick={(e) => {
                                                                handleChangeFlag(false);
                                                                handleSavePassword();
                                                            }}
                                                        >
                                                            保存
                                                        </button>
                                                        <button
                                                            className="ml-4 w-20 h-full bg-pink-800 text-white px-2 py-2 rounded hover:bg-pink-900"
                                                            onClick={() => {
                                                                handleChangeFlag(false);
                                                            }}
                                                        >
                                                            戻る
                                                        </button>
                                                    </span>
                                                </div>
                                            )}

                                        </div>
                                        <div className="mb-4">
                                            <label className="mb-3 block text-sm font-medium text-black">
                                                合計リスト数
                                            </label>
                                            <input
                                                type="number"
                                                placeholder=""
                                                value={countSum}
                                                className="w-full rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary bg-gray-200"
                                                readOnly
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="mb-3 block text-sm font-medium text-black">
                                                合計依頼数
                                            </label>
                                            <input
                                                type="number"
                                                placeholder=""
                                                value={count_request}
                                                className="w-full rounded border-[1.5px] border-stroke px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-300 focus:border-primary bg-gray-200"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    })()}
                </div>
            </div>
        </>
    );
};

export default FormLayout;
