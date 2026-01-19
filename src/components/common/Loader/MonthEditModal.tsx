import React, { Dispatch, SetStateAction } from 'react';

interface MonthEditModalProps {
    onClose: () => void;
    monthTarget: Date;
    setMonthTarget: Dispatch<SetStateAction<Date>>;
    getMonthData: (date: Date) => Promise<void>;
    monthData: MonthData;
}

interface Request {
    id: number;
    requestRandId: string;
    projectName: string;
    completeState: number;
    areaSelection: string;
    listCount: number;
}

interface MonthData {
    requestsRed: Request[];
    requestsBlue: Request[];
    requestsGreen: Request[];
    requestsYellow: Request[];
    requestsPink: Request[];
}



const MonthEditModal: React.FC<MonthEditModalProps> = ({ onClose, monthTarget, setMonthTarget, getMonthData, monthData }) => {
    console.log(monthData);
    const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i);
    const months = Array.from({length: 12}, (_, i) => i + 1);
    
    const handleYearChange = (year: number) => {
        const newDate = new Date(monthTarget);
        newDate.setFullYear(year);
        setMonthTarget(newDate);
    };

    const handleMonthChange = (month: number) => {
        const newDate = new Date(monthTarget);
        newDate.setMonth(month - 1);
        setMonthTarget(newDate);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
            <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
                <div className="max-w-full overflow-x-auto">
                    <div className="flex items-center mb-4 justify-center">
                        <button 
                            onClick={() => {
                                const newDate = new Date(monthTarget);
                                newDate.setMonth(monthTarget.getMonth() - 1);
                                setMonthTarget(newDate);
                                getMonthData(newDate);
                            }}
                            className="text-gray-600 hover:text-gray-800 px-4"
                        >
                            {'<<'}
                        </button>
                        <div className="flex items-center relative">
                            <div className="flex items-center space-x-2">
                                <select 
                                    value={monthTarget.getFullYear()}
                                    onChange={(e) => handleYearChange(Number(e.target.value))}
                                    className="bg-teal-600 text-white px-2 py-1 rounded"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}年</option>
                                    ))}
                                </select>
                                <select 
                                    value={monthTarget.getMonth() + 1}
                                    onChange={(e) => handleMonthChange(Number(e.target.value))}
                                    className="bg-teal-600 text-white px-2 py-1 rounded"
                                >
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}月</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                const newDate = new Date(monthTarget);
                                newDate.setMonth(monthTarget.getMonth() + 1);
                                setMonthTarget(newDate);
                                getMonthData(newDate);
                            }}
                            className="text-gray-600 hover:text-gray-800 px-4"
                        >
                            {'>>'}
                        </button>
                    </div>
                    <table className="w-full table-auto">
                        <thead>
                            <tr>
                                <th className="min-w-[120px] px-4 py-2 font-medium text-black"></th>
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
                                    -
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsRed?.length || 0} */}
                                    {monthData.requestsRed.length}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-blue-500 text-white px-4 py-2 rounded">ブルー</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsBlue?.reduce((sum, item) => sum + item.listCount, 0) || 0} */}
                                    {monthData.requestsBlue.reduce((sum, item) => sum + item.listCount, 0)}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsBlue.length}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-green-500 text-white px-4 py-2 rounded">グリーン</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsGreen.reduce((sum, item) => sum + item.listCount, 0)}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsGreen.length}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-yellow-400 text-white px-4 py-2 rounded">イエロー</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsYellow.reduce((sum, item) => sum + item.listCount, 0)}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsYellow.length}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-pink-500 text-white px-4 py-2 rounded">ピンク</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsPink.reduce((sum, item) => sum + item.listCount, 0)}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsPink.length}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="px-4 py-2 rounded">合計
                                    </div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsRed.reduce((sum, item) => sum + item.listCount, 0) + monthData.requestsBlue.reduce((sum, item) => sum + item.listCount, 0) + monthData.requestsGreen.reduce((sum, item) => sum + item.listCount, 0) + monthData.requestsYellow.reduce((sum, item) => sum + item.listCount, 0) + monthData.requestsPink.reduce((sum, item) => sum + item.listCount, 0)}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {monthData.requestsRed.length + monthData.requestsBlue.length + monthData.requestsGreen.length + monthData.requestsYellow.length + monthData.requestsPink.length}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MonthEditModal;