"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const SignupCheckContent = () => {
    const [message, setMessage] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        setEmail(searchParams.get('email'));
    }, [searchParams]);

    const handleSubmit = async () => {
        if(phoneNumber.length < 9 || phoneNumber.length > 12){
            setMessage("電話番号が正しくありません");
            return;
        }
        const requestData = {
            phone: phoneNumber,
            email: email
        }
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/phoneadd`, requestData);
            setMessage(response.data.message);
            if(response.status === 200){
                router.push("/auth/signin");
            }
        } catch (error) {
            setMessage("エラーが発生しました");
        }
    }

    return (
        <div className="bg-white border border-gray-300 p-8 rounded-lg w-full max-w-lg text-black">
            <h1 className="text-2xl mb-6 text-center">無料でアカウントを作成する</h1>
            
            {/* Progress Steps */}
            <div className="flex items-center mb-8 text-white">
                <div className="flex-1 text-center py-2 rounded-l-full bg-gray-600">
                    アドレス登録
                </div>
                <div className="flex-1 text-center py-2 bg-gray-600">
                    メール認証
                </div>
                <div className="flex-1 text-center py-2 rounded-r-full bg-blue-500">
                    登録完了
                </div>
            </div>
            <div className='my-16 mb-4'>
                <p className="text-center text-gray-600 text-base py-2">
                    アカウント登録ありがとうございます。電話番号を登録してください。
                </p>
                <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="電話番号を入力してください"
                onChange={(e) => {
                    const phoneNumber = e.target.value.replace(/[^0-9]/g, '');
                    setPhoneNumber(phoneNumber);
                }}
                value={phoneNumber}
                />
                <p className="text-center text-gray-600 text-base py-2">
                    {message}
                </p>
                <div className="flex justify-center my-2">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleSubmit}>
                        確認
                    </button>
                </div>
            </div>
        </div>
    );
};

const CheckmailPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Suspense fallback={<div>Loading...</div>}>
                <SignupCheckContent />
            </Suspense>
        </div>
    );
};

export default CheckmailPage;