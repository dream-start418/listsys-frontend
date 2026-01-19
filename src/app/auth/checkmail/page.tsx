const CheckmailPage = () => {

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="bg-white border border-gray-300 p-8 rounded-lg w-full max-w-lg text-black">
                <h1 className="text-2xl mb-6 text-center">無料でアカウントを作成する</h1>
                
                {/* Progress Steps */}
                <div className="flex items-center mb-8 text-white">
                    <div className="flex-1 text-center py-2 rounded-l-full bg-gray-600">
                        アドレス登録
                    </div>
                    <div className="flex-1 text-center py-2 bg-blue-500">
                        メール認証
                    </div>
                    <div className="flex-1 text-center py-2 rounded-r-full bg-gray-600">
                        登録完了
                    </div>
                </div>
                <div className='my-16'>
                    <p className="text-center text-gray-600 text-xl py-2">
                        メールアドレスに新規登録情報を送信しました。
                    </p>
                    <p className="text-center text-gray-600 text-xl">
                        メールを確認してください
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckmailPage;