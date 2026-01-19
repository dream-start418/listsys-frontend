import React, { useState, useEffect } from "react";

interface TagInputProps {
    data: string[];
    getTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ data, getTags }) => {
    const [tags, setTags] = useState<string[]>(data);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        setTags(data);
    }, [data]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const tagValue = inputValue.trim();
            if (tagValue && !tags.includes(tagValue)) {
                const newTags = [...tags, tagValue];
                setTags(newTags);
                setInputValue("");
                getTags(newTags);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Allow only numbers
            setInputValue(value);
        }
    };

    const removeTag = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
        getTags(newTags);
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center border border-gray-300 rounded-lg p-2">
                {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center bg-blue-500 text-white px-2 py-1 rounded-full mr-2 mb-2">
                        {tag}
                        <button
                            type="button"
                            className="ml-2 text-white bg-none border-none cursor-pointer"
                            onClick={() => removeTag(index)}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    id="tagInput"
                    placeholder="タグを入力してEnterを押してください（数字のみ）。"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="flex-grow bg-gray-50 border-none text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 placeholder-gray-400 outline-none"
                />
            </div>
        </div>
    );
};

export default TagInput;