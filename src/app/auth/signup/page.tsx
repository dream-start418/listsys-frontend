"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const SignupPage = () => {
  const router = useRouter();
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [step, setStep] = useState(1); // 1: アドレス登録, 2: メール認証, 3: 登録完了
    const [emailError, setEmailError] = useState('');
    const [isValid, setIsValid] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
        
        if (!email) {
            setEmailError('メールアドレスを入力してください');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('有効なメールアドレスを入力してください');
            return false;
        }
        
        setEmailError('');
        return true;
    };

    useEffect(() => {
        setIsValid(validateEmail(email) && agreed);
    }, [email, agreed]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`${process.env.NEXT_PUBLIC_API_URL}--`)
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, { email });
        if(response.status === 200){
            router.push('/auth/checkmail');
        } else {
            setEmailError(response.data.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="bg-white border border-gray-300 p-8 rounded-lg w-full max-w-lg text-black">
                <h1 className="text-2xl mb-6 text-center">無料でアカウントを作成する</h1>
                
                {/* Progress Steps */}
                <div className="flex items-center mb-8 text-white">
                    <div className="flex-1 text-center py-2 rounded-l-full bg-blue-500">
                        アドレス登録
                    </div>
                    <div className="flex-1 text-center py-2 bg-gray-600">
                        メール認証
                    </div>
                    <div className="flex-1 text-center py-2 rounded-r-full bg-gray-600">
                        登録完了
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block mb-2">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            onBlur={() => validateEmail(email)}
                            className={`w-full p-3 rounded border ${
                                emailError ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="メールアドレス"
                            required
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center text-base">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mr-2"
                            />
                            <span>
                                <Link href="/terms" className="underline">サービス契約</Link>
                                および
                                <Link href="/privacy" className="underline">プライバシーポリシー</Link>
                                に同意します。
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`w-full py-3 rounded font-bold mb-4 ${
                            isValid 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        無料でアカウントを作成する
                    </button>

                    <div className="text-center">
                        <Link href="/auth/signin" className="text-gray-600 hover:underline">
                            すでにアカウントをお持ちの方はこちら
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;