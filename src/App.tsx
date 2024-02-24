import { useState, useRef } from 'react';
import './App.css';

function App() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');
    const [totalUploadProgress, setTotalUploadProgress] = useState(0);

    const uploadRequestRef = useRef(null);

    const handleFileSelect = (event) => {
        setSelectedFiles([...selectedFiles, ...event.target.files]);
    };

    const handleFileUpload = async () => {
        const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
        let uploadedSize = 0;

        try {
            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('files', file);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://httpbin.org/post');

                xhr.upload.onprogress = (progressEvent) => {
                    if (progressEvent.lengthComputable) {
                        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
                        setTotalUploadProgress((prevProgress) => prevProgress + (progress / 100) * (file.size / totalSize) * 100);
                    }
                };

                xhr.onload = () => {
                    uploadedSize += file.size;
                    if (uploadedSize === totalSize) {
                        setUploadStatus('Dosyalar başarıyla gönderildi.');
                    }
                };

                xhr.onerror = () => {
                    setUploadStatus('Dosyalar gönderilirken bir hata oluştu: (' + error.message + ') hatası.'); // Hata mesajını setUploadStatus ile ayarla
                };



                xhr.send(formData);
            }
        } catch (error) {
            console.error('Dosyaları gönderirken bir hata oluştu:', error);
            setUploadStatus('Dosyalar gönderilirken bir hata oluştu: (' + error.message + ') hatası.'); // Hata mesajını setUploadStatus ile ayarla
        } finally {
            setSelectedFiles([]);
        }
    };



    const handleCancelUpload = () => {
        if (uploadRequestRef.current) {
            uploadRequestRef.current.abort(); // HTTP isteğini iptal et
        }
        setUploadStatus('Dosya yükleme işlemi iptal edildi.');
        setUploadProgress({}); // Tüm yükleme ilerlemesini sıfırla
        setTotalUploadProgress(0); // Toplam yükleme ilerlemesini sıfırla
        setSelectedFiles([]); // Seçilen dosyaları sıfırla
    };


    const handleFileRemove = (fileToRemove) => {
        setSelectedFiles(selectedFiles.filter((file) => file !== fileToRemove));
        setUploadProgress((prev) => {
            const { [fileToRemove.name]: removedValue, ...rest } = prev;
            return rest;
        });
    };

    return (
        <>
            <p className="upload-text shadow-xl">UPLOADING APPLICATION</p>

            <div className="card shadow-xl">
                <div className="label-content py-1 text-lg">
                    <label htmlFor="message" className="label-text">GÖNDERİM DURUMU VE DOSYALAR</label>
                    <p>{uploadStatus}</p>
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="file-upload-container">
                            <div className="file-info">
                                <p className="file-name">{file.name}</p>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${uploadProgress[file.name] || 0}%` }}>
                                        {uploadProgress[file.name] || 0}%
                                    </div>
                                </div>
                            </div>
                            <button className="remove-button shadow-xl" onClick={() => handleFileRemove(file)}>Dosyayı Sil</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card shadow-xl">
                <div className="label-content py-1 text-lg">
                    <label htmlFor="message" className="label-text">GÖNDERİM İLERLEMESİ</label>
                    <div className="progress-bar-container ">
                        <div className="progress-bar" style={{ width: `${totalUploadProgress}%` }}>
                            {totalUploadProgress}%
                        </div>
                    </div>
                </div>
            </div>

            <label htmlFor="fileInput" className="custom-button button1 shadow-xl text-2xl">DOSYA SEÇ</label>
            <input type="file" id="fileInput" multiple style={{ display: "none" }} onChange={handleFileSelect} />
            <button type="button" className="custom-button button2 shadow-xl" onClick={handleFileUpload}>GÖNDER</button>
            <button type="button" className="custom-button button3 shadow-xl" onClick={handleCancelUpload}>İPTAL ET</button>
        </>
    );
}

export default App;
