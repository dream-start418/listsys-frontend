"use client"
import React, { useState } from "react";
import axios from 'axios';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Loader from "@/components/common/Loader";

interface LoginResponse {
    message: string;
    token: string;
}

const RestPass: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSendMessage = async () => {
        setLoading(true);
        try {
            await axios.post<LoginResponse>(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password-reset-request`, { email });
            router.push("/auth/signin")
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };
    if(loading) {
        return <Loader />
    }

    return (
        <>
            <div className="mx-auto h-screen mt-8 w-max-w-screen-2xl p-4 md:p-6 2xl:p-10 lg:mt-16 xl:w-1/2">
                <div className="rounded-sm border shadow-default border-strokedark bg-white">
                    <div className="flex flex-wrap items-center">
                        <div className="w-full border-stroke xl:border-l-2">
                            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                                <span className="mb-1.5 block font-medium">　</span>
                                <h2 className="mb-9 mx-4 text-2xl font-bold text-black sm:text-title-xl2">
                                    パスワードリセット
                                </h2>
                                <div className="mb-4">
                                    <label className="mb-2.5 mx-2 block font-medium text-black">
                                        メールアドレス
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="メールアドレスを入力してください。"
                                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
                                        />

                                        <span className="absolute right-4 top-4">
                                            <svg
                                                className="fill-current"
                                                width="22"
                                                height="22"
                                                viewBox="0 0 22 22"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.5">
                                                    <path
                                                        d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                                                        fill=""
                                                    />
                                                </g>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <p>{message}</p>
                                <div className="mb-5">
                                    <button
                                        className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-black transition hover:bg-gray-100"
                                        onClick={handleSendMessage}
                                        >
                                            送信
                                        </button>
                                </div>



                                <div className="mt-6 text-center">
                                    <p>
                                        <Link href="/auth/signin" className="text-primary">
                                            ログイン
                                        </Link>
                                    </p>
                                </div>

                        </div>
                    </div>
                </div>
            </div>
        </div >
    </>
  );
};

export default RestPass;
