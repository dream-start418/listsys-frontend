"use client";

import React, { useState, useEffect } from "react";
import { requestGroupCheckData4, requestGroupCheckData3 } from "@/constant/RequestGroup";
import LargeModal from "../common/Loader/LargeModal";
import GroupCheckBox from "./GroupCheckBox/GroupCheckBox";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import TagInput from "../common/Loader/TagInput";
import axios from "axios";

interface RequestGroup {
    category: string;
    options: string[];
}

interface DecodedToken {
    id: string; // Adjust the type based on your token structure
    exp?: number; // Token expiry timestamp
    iat?: number;
    role: number;
}

interface User {
    id: number;
    contractId: string;
    name: string;
    email: string;
    listCount: number;
    requestCount: number;
    createdAt: Date;
    role: number;
    planId: number;
}

const NewRequestPink: React.FC = () => {
    const [user, setUser] = useState<User>();
    const datasets = [
        { name: "area_condition", data: requestGroupCheckData3 }
    ];
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: { [key: string]: boolean } }>({});
    const [checkedCategories, setCheckedCategories] = useState<{ [key: string]: boolean }>({});
    const [areaSelection, setAreaSelection] = useState("");
    const [areaMemo, setAreaMemo] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [wishNum, setWishNum] = useState(-1);
    const [detailCondition, setDetailCondition] = useState("");
    const [isCheckBoxModalOpen, setIsCheckBoxModalOpen] = useState(false);
    const [currentConditon, setCurrentCondition] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("listan_token");
            if (!token) {
                console.log("Token not found.");
                return;
            }
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` }, // Add token to the header
                });
                setUser(response.data);
            } catch (error) {
                console.log("Error fetching clients:", error);
            }
        };
        fetchUser();
    }, []);

    const handleCheckboxChange = (datasetName: string, category: string, option: string) => {
        setCheckedItems((prev) => ({
            ...prev,
            [`${datasetName}-${category}`]: {
                ...prev[`${datasetName}-${category}`],
                [option]: !prev[`${datasetName}-${category}`]?.[option], // Toggle checkbox
            },
        }));
    };

    const handleCategoryCheckboxChange = (datasetName: string, category: string, options: string[]) => {
        const isChecked = !checkedCategories[`${datasetName}-${category}`];

        setCheckedCategories((prev) => ({
            ...prev,
            [`${datasetName}-${category}`]: isChecked,
        }));
        setCheckedItems((prev) => ({
            ...prev,
            [`${datasetName}-${category}`]: options.reduce((acc, option) => {
                acc[option] = isChecked;
                return acc;
            }, {} as { [key: string]: boolean }),
        }));
    };

    // Function to get all selected checkbox values
    const getSelectedValues = () => {
        const selectedValues: { [key: string]: { [key: string]: string[] } } = {};
        Object.keys(checkedItems).forEach((key) => {
            const [datasetName, category] = key.split("-");
            const options = checkedItems[key];
            const selectedOptions = Object.keys(options).filter((option) => options[option]);
            if (selectedOptions.length > 0) {
                if (!selectedValues[datasetName]) selectedValues[datasetName] = {};
                selectedValues[datasetName][category] = selectedOptions;
            }
        });

        return selectedValues;
    };

    // const confirmValues = () => {
    //     const selectedValues = getSelectedValues();
    //     setDetailCondition(JSON.stringify(selectedValues.detail_condition, null, 2))
    //     setAreaSelection(JSON.stringify(selectedValues.area_condition, null, 2))
    // };

    const confirmValues = () => {

        const selectedValues = getSelectedValues();
        const requestData = {
            projectName,
            wishNum,
            areaSelection: selectedValues.area_condition || {},
            areaMemo,
        };
        if(projectName === "" || (wishNum ?? -1) < 0 || Object.keys(requestData.areaSelection).length === 0){
            alert("必須項目を入力してください。");
            return 0;
        }
        setDetailCondition(JSON.stringify(selectedValues.detail_condition, null, 2))
        setAreaSelection(JSON.stringify(selectedValues.area_condition, null, 2))
        return 1;
    };

    const handleSubmit = async ({completeState} : {completeState: number}) => {
        const token = localStorage.getItem('listan_token');
        if (!token) {
            alert('ユーザーは認証されていません。ログインしてください。');
            return;
        }

        let userId;
        try {
            // Decode the token to extract user information
            const decodedToken = jwtDecode<DecodedToken>(token) // jwtDecode automatically decodes the token
            userId = decodedToken.id; // Extract the user ID
        } catch (error) {
            console.error('Error decoding token:', error);
            alert('トークンが無効です。もう一度ログインしてください。');
            return;
        }

        const selectedValues = getSelectedValues();
        console.log('Selected values:', selectedValues);

        const requestData = {
            userId: userId, // Replace with the actual user ID
            projectName,
            wishNum,
            areaSelection: selectedValues.area_condition || {},
            areaMemo,
            completeState,
        };
        if(projectName === "" || (wishNum ?? -1) < 0 || Object.keys(requestData.areaSelection).length === 0) {
            alert("必須項目を入力してください。");
            return;
        }
        if (user?.planId !== 1) {
            alert("有料プランにアップグレードしてください。");
            return;
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/add_request_pink`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Request saved successfully:', data);
                router.push("/list_request")
            } else {
                console.error('Failed to save request:', response.statusText);
                alert('保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving request:', error);
            alert('保存中にエラーが発生しました。');
        }
    }

    const checkPlan = () => {
        if (user?.planId !== 1) {
            alert("有料プランにアップグレードしてください。");
            return;
        } else {
            setIsAddModalOpen(true);
        }
    }
    return (
        <div className="rounded-sm border border-stroke shadow-default bg-white p-4">
            <div>
                <div className="my-4">
                    <label htmlFor="project_name" className="block mb-2 text-base font-base text-balck">プロジェクト名<span className="text-red-500 text-sm ml-2">※</span></label>
                    <input type="text" id="project_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-600 placeholder-gray-400 focus:ring-blue-500"
                        onChange={(e) => { setProjectName(e.target.value) }}
                        value={projectName}
                        required />
                </div>
                <div className="my-4">
                    <label htmlFor="project_name" className="block mb-2 text-base font-base text-balck">希望件数<span className="text-red-500 text-sm ml-2">※</span></label>
                    <input type="text" id="project_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-600 placeholder-gray-400 focus:ring-blue-500"
                        onChange={(e) => {
                            let value = e.target.value;
                            if(value === ""){
                                setWishNum(-1);
                            }else{
                                value = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
                                const intValue = Number(value);
                                setWishNum(intValue);
                            }
                        }}
                        value={(wishNum >= 0) ? wishNum : ""}
                        required
                    />
                </div>
            </div>
            {datasets.map((dataset, datasetIndex) => (
                <div key={datasetIndex}>
                    <div className="flex">
                        <h2 className="text-lg font-base text-black my-4">{(dataset.name === "detail_condition") ? "条件の絞り込み" : (dataset.name === "sub_condition") ? "その他条件の絞り込み" : (<>エリアの絞り込み<span className="text-red-500 text-sm ml-2">※</span></>)}</h2>
                        <button className="text-blue-500 ml-4"
                            onClick={() => {
                                const prefix = `${dataset.name}-`;

                                setCheckedCategories((prev) => {
                                    const newCheckedCategories = { ...prev };
                                    Object.keys(newCheckedCategories).forEach(key => {
                                        if (key.startsWith(prefix)) {
                                            delete newCheckedCategories[key];
                                        }
                                    });
                                    return newCheckedCategories;
                                });

                                setCheckedItems((prev) => {
                                    const newCheckedItems = { ...prev };
                                    Object.keys(newCheckedItems).forEach(key => {
                                        if (key.startsWith(prefix)) {
                                            delete newCheckedItems[key];
                                        }
                                    });
                                    return newCheckedItems;
                                });
                            }}
                        >
                            条件リセット
                        </button>
                    </div>
                    <table className="w-full border-collapse border border-gray-700">
                        <tbody>
                            {dataset.data.map((item: RequestGroup, index: number) => (
                                <tr key={index} className="even:bg-white odd:bg-gray-200 text-black">
                                    <td className="border border-gray-700 p-2 align-top min-w-16">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`category-${dataset.name}-${item.category}`}
                                                checked={checkedCategories[`${dataset.name}-${item.category}`] || false}
                                                onChange={() =>
                                                    handleCategoryCheckboxChange(dataset.name, item.category, item.options)
                                                }
                                                className="form-checkbox text-blue-500 mr-2"
                                            />
                                            <label
                                                htmlFor={`category-${dataset.name}-${item.category}`}
                                                className="cursor-pointer"
                                            >
                                                {item.category}
                                            </label>
                                        </div>
                                    </td>
                                    <td className="border border-gray-700 p-2">
                                        <ul className="flex flex-wrap list-none">
                                            {item.options.map((option: string, idx: number) => (
                                                <li key={idx} className="flex items-center mx-4">
                                                    <input
                                                        type="checkbox"
                                                        id={`${dataset.name}-${item.category}-${option}`}
                                                        checked={
                                                            checkedItems[`${dataset.name}-${item.category}`]?.[option] || false
                                                        }
                                                        onChange={() =>
                                                            handleCheckboxChange(dataset.name, item.category, option)
                                                        }
                                                        className="form-checkbox text-blue-500"
                                                    />
                                                    <label
                                                        htmlFor={`${dataset.name}-${item.category}-${option}`}
                                                        className="cursor-pointer ml-2"
                                                    >
                                                        {option}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
            <div>
                <div className="my-4">
                    <label htmlFor="area_memo" className="block mb-2 text-base font-medium text-black">市区</label>
                    <textarea id="area_memo" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500 min-h-24"
                        onChange={(e) => { setAreaMemo(e.target.value) }}
                        value={areaMemo}
                        placeholder="市や区のご依頼があれば入力ください。"
                        required>
                    </textarea>
                </div>
            </div>
            <div>
                <button
                    onClick={() => { history.back() }}
                    className="mt-4 mx-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    閉じる
                </button>
                <button
                    onClick={() => {
                        if(confirmValues()){
                            checkPlan();
                        }
                    }}
                    className="mt-4 mx-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    確認画面
                </button>
            </div>
            <LargeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <div className="space-y-4 w-full text-black">
                    <div>
                        <div className="relative z-20 bg-white border-gray-300">
                            <div className="my-4">
                                <label htmlFor="project_name_confirm" className="block mb-2 text-base font-medium text-gray-900 text-black">プロジェクト名<span className="text-red-500 text-sm ml-2">※</span></label>
                                <input type="text" id="project_name_confirm"
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-200 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => { setProjectName(e.target.value) }}
                                    value={projectName}
                                    required
                                    readOnly
                                />
                            </div>
                            <div className="my-4">
                                <label htmlFor="project_name_confirm" className="block mb-2 text-base font-medium text-gray-900 text-black">希望件数<span className="text-red-500 text-sm ml-2">※</span></label>
                                <input type="number" id="project_name_confirm"
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-200 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
                                    value={wishNum}
                                    required
                                    readOnly
                                />
                            </div>
                            {datasets.map((dataset, datasetIndex) => (
                                <div key={datasetIndex}>
                                    <h2 className="text-lg font-base text-black my-4">{(dataset.name === "detail_condition") ? "条件の絞り込み" : (dataset.name === "sub_condition") ? "その他条件の絞り込み" : (<>エリアの絞り込み<span className="text-red-500 text-sm ml-2">※</span></>)}</h2>
                                    <button
                                        onClick={() => {
                                            setIsCheckBoxModalOpen(true)
                                            setCurrentCondition(dataset.name)
                                        }}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        データを表示
                                    </button>
                                    <GroupCheckBox
                                        isOpen={isCheckBoxModalOpen}
                                        onClose={() => setIsCheckBoxModalOpen(false)}
                                        dataset={dataset}
                                        current_condition={currentConditon}
                                        checkedCategories={checkedCategories}
                                        checkedItems={checkedItems}
                                    />
                                </div>
                            ))}
                            <div className="my-4">
                                <label htmlFor="area_memo_confirm" className="block mb-2 text-base font-medium text-gray-900 text-black">市区</label>
                                <textarea id="area_memo_confirm"
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-200 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500 min-h-24"
                                    onChange={(e) => { setAreaMemo(e.target.value) }}
                                    value={areaMemo}
                                    required
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <p>この内容でよろしいでしょうか？
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 mx-4"
                        >
                            戻る
                        </button>
                        <button
                            onClick={() => {
                                setIsAddModalOpen(false);
                                handleSubmit({completeState: 0});
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mx-4"
                        >
                            下書き保存
                        </button>
                        <button
                            onClick={() => {
                                setIsAddModalOpen(false);
                                handleSubmit({completeState: 1});
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mx-4"
                        >
                            依頼する
                        </button>
                    </div>
                </div>
            </LargeModal>
        </div>
    );
};

export default NewRequestPink;