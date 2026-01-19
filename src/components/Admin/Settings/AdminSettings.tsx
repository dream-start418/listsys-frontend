"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";
import { jwtDecode } from "jwt-decode";

const AdminSettings = () => {
    const [chatworkToken, setChatworkToken] = useState("");
    const [chatworkRoomId, setChatworkRoomId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchChatworkSettings = async () => {
            try {
                const token = localStorage.getItem('listan_token');
                if (!token) {
                    setError('ログインが必要です');
                    setIsLoading(false);
                    return;
                }
                const decoded = jwtDecode(token) as { role?: number };
        
                if (!decoded.role || decoded.role < 1) {
                    setError('管理者権限が必要です');
                    setIsLoading(false);
                    return;
                }
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/chatwork/get`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('listan_token')}`,
                    }
                });
                console.log(response);
                if(response == null || response.status !== 200) {
                    setError("データの取得に失敗しました");
                    setIsLoading(false);
                    return;
                }
                setChatworkToken(response.data.chatworkToken);
                setChatworkRoomId(response.data.chatworkRoomId);
                setIsLoading(false);
            } catch (error) {
                setError("データの取得中にエラーが発生しました");
                setIsLoading(false);
            }
        };
        fetchChatworkSettings();
    }, []);

    const handleSave = async () => {
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/chatwork/save`, {
                chatworkToken,
                chatworkRoomId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('listan_token')}`,
                }
            });
            if (response.status === 200) {
                setSuccess("設定が正常に保存されました");
            } else {
                setError("設定の保存に失敗しました");
            }
        } catch (error) {
            setError("設定の保存中にエラーが発生しました");
        }
    };

    if(isLoading) {
        return <Loader />;
    }

    return (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default min-h-[500px]">
            <h2 className="text-2xl font-semibold text-black mb-6">Chatwork設定</h2>
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md relative">
                    <button 
                        onClick={() => setError(null)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <p className="text-red-600 flex items-center pr-6">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md relative">
                    <button 
                        onClick={() => setSuccess(null)}
                        className="absolute top-2 right-2 text-green-600 hover:text-green-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <p className="text-green-600 flex items-center pr-6">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {success}
                    </p>
                </div>
            )}
            <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <label htmlFor="chatwork-token" className="block text-sm font-medium text-gray-700">
                        Chatwork トークン
                    </label>
                    <input
                        id="chatwork-token"
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        placeholder="Chatwork APIトークンを入力"
                        value={chatworkToken}
                        onChange={(e) => setChatworkToken(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="chatwork-room" className="block text-sm font-medium text-gray-700">
                        Chatwork ルームID
                    </label>
                    <input
                        id="chatwork-room"
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        placeholder="ChatworkルームIDを入力"
                        value={chatworkRoomId}
                        onChange={(e) => setChatworkRoomId(e.target.value)}
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                    />
                </div>
                <div className="pt-4">
                    <button 
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={handleSave} 
                        disabled={!chatworkToken || !chatworkRoomId}
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
