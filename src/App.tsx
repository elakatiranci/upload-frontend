import './App.css';
import React, { useState } from 'react';
import { Trash2 } from "lucide-react";
import axios, { AxiosResponse, CancelTokenSource } from 'axios';
function App() {
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>("Not Started");
    const [uploadPercentage, setUploadPercentage] = useState<{[key: string]: number}>({});
    const [cancelTokenSource, setCancelTokenSource] = useState<CancelTokenSource | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const validFiles: File[] = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                if (file.size <= 50 * 1024 * 1024) { // 50MB sınırı
                    validFiles.push(file);
                } else {
                    console.log(`Dosya (${file.name}) 50MB sınırını aşıyor ve yüklenmedi.`);
                }
            }
            if (validFiles.length > 0) {
                if (files) {
                    const updatedFiles = Array.from(files);
                    updatedFiles.push(...validFiles);
                    setFiles(updatedFiles);
                } else {
                    setFiles(validFiles);
                }
            }
        }
    }
    const handleAdditionalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const validFiles: File[] = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                if (file.size <= 50 * 1024 * 1024) { // 50MB sınırı
                    validFiles.push(file);
                } else {
                    console.log(`Dosya (${file.name}) 50MB sınırını aşıyor ve yüklenmedi.`);
                }
            }
            if (validFiles.length > 0) {
                setFiles(validFiles);
            }
        }
    }
    const handleFileDelete = (fileName: string) => {
        if (files) {
            const updatedFiles = Array.from(files).filter(file => file.name !== fileName);
            setFiles(updatedFiles);
        }
    }
    const uploadFiles = async () => {
        if (files && files.length > 0) {
            setUploadStatus("Uploading");
            const uploadPromises: Promise<AxiosResponse>[] = [];
            const source = axios.CancelToken.source();
            setCancelTokenSource(source);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append("file", file);

                const uploadPromise = axios.post<AxiosResponse>("https://httpbin.org/post", formData, {
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total !== undefined) {
                            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadPercentage((prev) => ({
                                ...prev,
                                [file.name]: percentage
                            }));
                        }
                    },
                    cancelToken: source.token
                })
                uploadPromises.push(uploadPromise);
            }
            try {
                await Promise.all(uploadPromises);
                setUploadStatus("Uploaded");
            } catch (error) {
                if (axios.isCancel(error)) {
                    setUploadStatus("Cancelled");
                } else {
                    console.error("Upload Error:", error);
                    setUploadStatus("Failed");
                }
            }
        } else {
            setUploadStatus("Dosya Yok");
        }
    }
    const cancelUpload = () => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel("Upload cancelled by user");
        }
    }
    const clearFiles = () => {
        setFiles(null);
        setUploadStatus("Not Started");
        setUploadPercentage({});
    }
    return (
        <>
            <p className="upload-text shadow-xl">UPLOADING APPLICATION</p>

            <div className="card shadow-xl">
                <div className="label-content w-full py-1 text-lg ">
                    <label htmlFor="message" className="label-text shadow-xl text-2xl">GÖNDERİM DURUMU VE DOSYALAR</label>

                    {uploadStatus === "Failed" && (
                        <div className="alert shadow-xl">
                            <p className="alert-text">GÖNDERİM BAŞARISIZ OLDU.</p>
                        </div>
                    )}

                    {uploadStatus === "Uploaded" && (
                        <div className="alert shadow-xl">
                            <p className="alert-text">GÖNDERİM TAMAMLANDI.</p>
                        </div>
                    )}

                    {uploadStatus === "Uploading" && (
                        <div className="alert shadow-xl">
                            <p className="alert-text">YÜKLENİYOR...</p>
                        </div>
                    )}

                    {uploadStatus === "Cancelled" && (
                        <div className="alert shadow-xl">
                            <p className="alert-text">İŞLEM İPTAL EDİLDİ.</p>
                        </div>
                    )}

                    {files && Array.from(files).map((file, index) => (
                        <div key={index} className="file-upload-container w-full">
                            <div className="shadow-lg p-3 rounded-2xl w-full flex justify-between">
                                <div className="w-full px-5">
                                    <p className="file-name">{file.name}</p>
                                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                        <div
                                            className="bg-[#f33fd7] text-xs font-medium text-white text-center p-0.5 leading-none rounded-full"
                                            style={{"width": `${uploadPercentage[file.name] == null ? 0 : uploadPercentage[file.name]}%`}}>
                                            {uploadPercentage[file.name] == null ? 0 : uploadPercentage[file.name]}%
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="bg-red-400 hover:bg-red-600 active:p-[11px] rounded-2xl text-white p-[13px]"
                                    onClick={() => handleFileDelete(file.name)}>
                                    <Trash2/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {!files && (
                        <div className="alert shadow-xl">
                            <p className="alert-text">DOSYA EKLEYİN(MAX 50MB).</p>
                        </div>
                    )}
                </div>
            </div>

            <label htmlFor="fileInput" className="custom-button button1 shadow-xl text-2xl">DOSYA EKLE</label>
            <input type="file" id="fileInput" multiple style={{display: "none"}} onChange={handleFileChange}/>
            <label htmlFor="additionalFileInput" className={`custom-button button2 shadow-xl text-2xl ${files ? '' : 'pointer-events-none'}`}>DAHA FAZLA DOSYA EKLE</label>
            <input type="file" id="additionalFileInput" multiple style={{display: "none"}} onChange={handleAdditionalFileUpload}/>
            <button type="button" className="custom-button button3 shadow-xl" onClick={uploadFiles}>GÖNDER</button>
            <button type="button" className="custom-button button4 shadow-xl" onClick={cancelUpload}>İPTAL ET</button>
            <button type="button" className="custom-button button5 shadow-xl" onClick={clearFiles}>TEMİZLE</button>
        </>
    );
}
export default App;
