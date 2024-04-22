import React, { useState } from 'react';
import axios from 'axios';
import '../styles/uploadCVForm.css';

const PORT = process.env.PORT

function UploadCVForm() {
    const [cvFile, setCvFile] = useState(null);

    const handleFileChange = (e) => {
        setCvFile(e.target.files[0]);// Prendre le premier fichier sélectionné
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('cv', cvFile);

        try {
            await axios.post('http://localhost:5000/upload-cv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('CV uploaded successfully');
        } catch (error) {
            console.error('Failed to upload CV:', error);
        }
    };

    return (
        <div>
        <h1>Importer un CV</h1>
        <form onSubmit={handleSubmit}>
            <input type="file" accept=".docx" onChange={handleFileChange} />
            <button type="submit">Importer le CV</button>
        </form>
        </div>
    );
}

export default UploadCVForm;