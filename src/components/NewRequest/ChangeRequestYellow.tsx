"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { requestGroupCheckData3 } from "@/constant/RequestGroup";
import { portalSites } from "@/constant/PotalSites";
import LargeModal from "../common/Loader/LargeModal";
import GroupCheckBox from "./GroupCheckBox/GroupCheckBox";
import { jwtDecode } from "jwt-decode";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "../common/Loader";

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
    name: string;
    email: string;
    contractId: string;
}

interface RequestList {
    id: number;
    requestRandId: string;
    projectName: string;
    wishNum: number;
    completeState: number;
    areaSelection: Record<string, any>;
    areaMemo: string;
    portalSite: string;
    listCount: number;
    fileName: string;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
    requestAt: Date;
    deliveryAt: Date;
    user: User;
}

const ChangeRequestYellow: React.FC = () => {
    const datasets = [
        { name: "area_condition", data: requestGroupCheckData3 }
    ];

    const [tags, setTags] = useState<string[]>([]);

    const [checkedItems, setCheckedItems] = useState<{ [key: string]: { [key: string]: boolean } }>({});
    const [checkedCategories, setCheckedCategories] = useState<{ [key: string]: boolean }>({});
    const [areaSelection, setAreaSelection] = useState("");
    const [areaMemo, setAreaMemo] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [wishNum, setWishNum] = useState(-1);
    const [isCheckBoxModalOpen, setIsCheckBoxModalOpen] = useState(false);
    const [currentConditon, setCurrentCondition] = useState("");
    const [currentRequest, setCurrentRequest] = useState<RequestList | null>(null);
    const [portalSite, setPortalSite] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestId = searchParams.get('requestId');

    const transformData = (
        input: Record<string, string[]>,
        groupData: RequestGroup[],
        condition_string: string
    ): { checkedCategories: Record<string, boolean>; checkedItems: Record<string, Record<string, boolean>> } => {
        const checkedCategories: Record<string, boolean> = {};
        const checkedItems: Record<string, Record<string, boolean>> = {};

        groupData.forEach((group) => {
            const categoryKey = `${condition_string}-${group.category}`;
            const selectedOptions = input[group.category] || [];

            // Set checked status for categories
            checkedCategories[categoryKey] = selectedOptions.length > 0;

            // Set checked status for individual options
            checkedItems[categoryKey] = group.options.reduce((acc, option) => {
                acc[option] = selectedOptions.includes(option);
                return acc;
            }, {} as Record<string, boolean>);
        });

        return { checkedCategories, checkedItems };
    };
    useEffect(() => {
        const fetchClients = async () => {
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
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/request_get_yellow`,
                    {
                        params: {
                            userId,
                            requestId
                        }, // Pass userId as a query parameter
                        headers: { Authorization: `Bearer ${token}` }, // Optional: Pass token in the header
                    }
                );
                setCurrentRequest(response.data.requestYellow);
                let tp_checkedCategories = {};
                let tp_checkedItems = {};
                if (response.data.requestYellow.areaSelection) {
                    const areaConditionData = transformData(
                        response.data.requestYellow.areaSelection, // Corrected from mainCondition to areaSelection
                        requestGroupCheckData3,
                        "area_condition"
                    );

                    tp_checkedCategories = { ...tp_checkedCategories, ...areaConditionData.checkedCategories };
                    tp_checkedItems = { ...tp_checkedItems, ...areaConditionData.checkedItems };
                }
                console.log(tp_checkedCategories);
                console.log(tp_checkedItems);
                setCheckedCategories(tp_checkedCategories);
                setCheckedItems(tp_checkedItems);
                console.log("Fetched clients:", response.data.requestYellow);

            } catch (error) {
                console.log("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [requestId]);

    const handleCheckboxChange = (datasetName: string, category: string, option: string) => {
        setCheckedItems((prev) => {
            const newCheckedItems = {
                ...prev,
                [`${datasetName}-${category}`]: {
                    ...prev[`${datasetName}-${category}`],
                    [option]: !prev[`${datasetName}-${category}`]?.[option], // Toggle checkbox
                },
            };

            // Find the dataset and category to get all options
            const dataset = datasets.find(d => d.name === datasetName);
            const categoryData = dataset?.data.find(c => c.category === category);
            
            if (categoryData) {
                // Check if all options are now selected
                const allOptionsSelected = categoryData.options.every(
                    opt => newCheckedItems[`${datasetName}-${category}`]?.[opt]
                );

                // Update the category checkbox state
                setCheckedCategories(prev => ({
                    ...prev,
                    [`${datasetName}-${category}`]: allOptionsSelected
                }));
            }

            return newCheckedItems;
        });
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

    const confirmValues = () => {

        const selectedValues = getSelectedValues();
        const requestData = {
            projectName: currentRequest?.projectName,
            wishNum: currentRequest?.wishNum,
            areaSelection: selectedValues.area_condition || {},
            portalSite: currentRequest?.portalSite,
            areaMemo: currentRequest?.areaMemo,
        };
        console.log(requestData);
        if(requestData.projectName === "" || (requestData.wishNum ?? -1) < 0 || requestData.portalSite === "" || Object.keys(requestData.areaSelection).length === 0){
            alert("必須項目を入力してください。");
            return 0;
        }
        setAreaSelection(JSON.stringify(selectedValues.area_condition, null, 2))
        return 1;
    };

    const handleSubmit = async ({ completeState }: { completeState: number }) => {
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

        const requestData = {
            userId: userId, // Replace with the actual user ID
            projectName: currentRequest?.projectName,
            wishNum: currentRequest?.wishNum,
            areaSelection: selectedValues.area_condition || {},
            portalSite: currentRequest?.portalSite,
            areaMemo: currentRequest?.areaMemo,
            completeState,
        };
        if(requestData.projectName === "" || (requestData.wishNum ?? -1) < 0 || requestData.portalSite === "" || Object.keys(requestData.areaSelection).length === 0){
            alert("必須項目を入力してください。");
            return;
        }
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/update_request_yellow/${currentRequest?.id}`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token for authentication
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                console.log('Request saved successfully:', response.data);
                router.push("/list_request");
            } else {
                console.error('Failed to save request:', response.statusText);
                alert('保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving request:', error);
            alert('保存中にエラーが発生しました。');
        }
    }

    return (
        <div className="rounded-sm border border-stroke shadow-default bg-white p-4">
            <div>
                <div className="my-4">
                    <label htmlFor="project_name" className="block mb-2 text-base font-base text-balck">プロジェクト名<span className="text-red-500 text-sm ml-2">※</span></label>
                    <input type="text" id="project_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-600 placeholder-gray-400 focus:ring-blue-500"
                        onChange={(e) => {
                            setCurrentRequest((prev) => prev ? ({
                                ...prev,
                                projectName: e.target.value,
                            }) : prev);
                        }}
                        value={currentRequest?.projectName || ''}
                        required />
                </div>
                <div className="my-4">
                    <label htmlFor="project_name" className="block mb-2 text-base font-base text-balck">希望件数<span className="text-red-500 text-sm ml-2">※</span></label>
                    <input type="text" id="project_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-600 placeholder-gray-400 focus:ring-blue-500"
                        onChange={(e) => {
                            let value = e.target.value;
                            if(value === ""){
                                setCurrentRequest((prev) => prev ? ({
                                    ...prev,
                                        wishNum: -1,
                                    }) : prev);
                            } else {
                                value = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
                                const intValue = Number(value);
                                setCurrentRequest((prev) => prev ? ({
                                    ...prev,
                                        wishNum: intValue,
                                    }) : prev);
                            }
                        }}
                        value={(currentRequest?.wishNum !== undefined && currentRequest?.wishNum >= 0) ? currentRequest.wishNum : ''}
                        required />
                </div>
                <div className="my-4">
                    <label htmlFor="potal_sites" className="block mb-2 text-base font-base text-black">ポータルサイト<span className="text-red-500 text-sm ml-2">※</span></label>
                    <select
                        id="potal_sites"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        value={currentRequest?.portalSite || ""}
                        onChange={(e) => setCurrentRequest((prev) => prev ? ({
                            ...prev,
                            portalSite: e.target.value,
                        }) : prev)}
                    >
                        {portalSites.map((item, itemIndex) => (
                            <option value={item} key={"portalSitesIndex-" + itemIndex}>
                                {(itemIndex) ? itemIndex : ""}　　{item}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {
                datasets.map((dataset, datasetIndex) => (
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
                ))
            }
            <div>
                <div className="my-4">
                    <label htmlFor="area_memo" className="block mb-2 text-base font-medium text-black">その他備考</label>
                    <textarea id="area_memo" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500 min-h-24"
                        onChange={(e) => {
                            setCurrentRequest((prev) => prev ? ({
                                ...prev,
                                areaMemo: e.target.value,
                            }) : prev);
                        }}
                        value={currentRequest?.areaMemo || ''}
                        placeholder="その他でご依頼内容があれば入力ください。"
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
                            setIsAddModalOpen(true);
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
                                    value={currentRequest?.projectName}
                                    required
                                    readOnly
                                />
                            </div>
                            <div className="my-4">
                                <label htmlFor="project_name_confirm" className="block mb-2 text-base font-medium text-gray-900 text-black">希望件数<span className="text-red-500 text-sm ml-2">※</span></label>
                                <input type="number" id="project_name_confirm"
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-200 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
                                    value={currentRequest?.wishNum}
                                    required
                                    readOnly
                                />
                            </div>
                            <div className="my-4">
                                <div className="my-4">
                                    <label htmlFor="tags" className="block mb-2 text-base font-base text-black">ポータルサイト<span className="text-red-500 text-sm ml-2">※</span></label>
                                    <input type="text"
                                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-200 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
                                        value={currentRequest?.portalSite}
                                        readOnly
                                    />
                                </div>
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
                                <label htmlFor="area_memo_confirm" className="block mb-2 text-base font-medium text-gray-900 text-black">その他備考</label>
                                <textarea id="area_memo_confirm"
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-200 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500 min-h-24"
                                    onChange={(e) => { setAreaMemo(e.target.value) }}
                                    value={currentRequest?.areaMemo}
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
                                handleSubmit({ completeState: 0 });
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mx-4"
                        >
                            下書き保存
                        </button>
                        <button
                            onClick={() => {
                                setIsAddModalOpen(false);
                                handleSubmit({ completeState: 1 });
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mx-4"
                        >
                            依頼する
                        </button>
                    </div>
                </div>
            </LargeModal>
        </div >
    );
};

export default ChangeRequestYellow;