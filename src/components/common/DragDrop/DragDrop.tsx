import { useState, DragEvent, ChangeEvent } from "react";

interface DragDropProps {
    onFileUpload: (file: File) => void;
}

const DragDrop: React.FC<DragDropProps> = ({ onFileUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);

        if (event.dataTransfer.files.length > 0) {
            const droppedFile = event.dataTransfer.files[0];
            setFile(droppedFile);
            // onFileUpload(droppedFile);
        }
    };

    const handleClick = () => {
        document.getElementById("fileInput")?.click();
    };

    const handleClickUplioad = () => {
        if (file) {
            onFileUpload(file);
        }
    }

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            // onFileUpload(selectedFile);
        }
    };

    return (
        <div
            className="flex w-fit p-1 px-2 pr-4 itmes-center justify-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleFileSelect}
            />
            {file ? (
                <div className="text-base flex items-center px-2"
                    onClick={handleClick}
                >
                    <p className="text-green-600 font-medium">Uploaded File: {file.name}</p>
                </div>
            ) : (
                <div
                    className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-full flex items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif] px-4"
                    onClick={handleClick}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 fill-gray-500 mr-4 mb-1" viewBox="0 0 32 32">
                        <path
                            d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                            data-original="#000000" />
                        <path
                            d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                            data-original="#000000" />
                    </svg>
                    アップロード
                </div>
            )}
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4 text-sm"
                onClick={handleClickUplioad}>
                リスト登録
            </button>
        </div>
    );
};

export default DragDrop;
