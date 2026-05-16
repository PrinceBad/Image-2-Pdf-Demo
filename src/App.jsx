import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jsPdfLoaded, setJsPdfLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const appendInputRef = useRef(null);

  // Custom modal state
  const [modal, setModal] = useState({ show: false, title: '', message: '', isError: false });

  // Dynamically load jsPDF
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    script.onload = () => setJsPdfLoaded(true);
    script.onerror = () => showModal("Error", "Failed to load PDF library. Please check your internet connection.", true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const showModal = (title, message, isError = false) => {
    setModal({ show: true, title, message, isError });
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) return;

    const imagePromises = validFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ 
          id: Math.random().toString(36).substr(2, 9),
          data: e.target.result, 
          name: file.name 
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then((newImages) => {
        setImages((prev) => [...prev, ...newImages]);
      })
      .catch(() => {
        showModal("Error", "There was an error processing one or more images.", true);
      });
  };

  const handleImageUpload = (event) => {
    processFiles(event.target.files);
    event.target.value = ''; // Reset input so the same files can be uploaded again if needed
  };

  const removeImage = (idToRemove) => {
    setImages(images.filter(img => img.id !== idToRemove));
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;

    if (!jsPdfLoaded || !window.jspdf) {
      showModal("Error", "PDF generator is still loading. Please wait a moment.", true);
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 50)); // UI thread breathing room
      
      const { jsPDF } = window.jspdf;
      // Default to A4 size for standard document feeling
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      images.forEach((image, index) => {
        if (index > 0) doc.addPage();
        
        // Calculate aspect ratio to fit the page gracefully with a small margin
        const margin = 10;
        const maxW = pageWidth - (margin * 2);
        const maxH = pageHeight - (margin * 2);
        
        // Let jsPDF handle the aspect ratio scaling automatically by omitting height/width dynamically
        doc.addImage(image.data, 'JPEG', margin, margin, maxW, maxH, undefined, 'FAST');
      });

      doc.save('converted_document.pdf');
      
      // Successfully converted
      showModal("Success!", "Your PDF has been created and downloaded successfully.");
    } catch (error) {
      console.error(error);
      showModal("Error", "Something went wrong during PDF generation.", true);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- UI Components ---
  
  // Icon SVGs
  const Icons = {
    Logo: () => (
      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    Plus: () => (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    SmallPlus: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    Trash: () => (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    Settings: () => (
      <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  return (
    <div 
      className="min-h-screen bg-[#f3f4f6] text-gray-800 font-sans flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 cursor-pointer">
          <Icons.Logo />
          <span className="font-bold text-xl tracking-tight text-gray-900">Image2PDF</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        
        {images.length === 0 ? (
          /* Empty State: Giant Hero Button (iLovePDF Style) */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Image to PDF
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl">
              Convert your images to PDF in seconds. Completely free and runs securely in your browser.
            </p>

            <div className="relative group">
              {/* Massive Blue Button */}
              <button 
                onClick={() => fileInputRef.current.click()}
                className={`relative z-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl py-8 px-16 rounded-xl shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 flex items-center gap-4 ${isDragging ? 'scale-105 bg-blue-500 ring-8 ring-blue-200' : ''}`}
              >
                <Icons.Plus />
                Select images
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
            
            <p className="mt-8 text-gray-400 font-medium tracking-wide">
              {isDragging ? 'Drop images here!' : 'or drop images here'}
            </p>
          </div>
        ) : (
          /* Workspace State: Previews on left, Actions on right */
          <div className="flex-1 flex flex-col md:flex-row bg-[#e8eaed]">
            
            {/* Left Area: Grid Preview */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex flex-wrap gap-6 items-start">
                
                {images.map((img) => (
                  <div key={img.id} className="relative group bg-white p-2 rounded shadow-sm border border-gray-200 w-40 h-56 flex flex-col justify-between hover:shadow-md transition-shadow">
                    
                    {/* Delete button (shows on hover) */}
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                      title="Remove image"
                    >
                      <Icons.Trash />
                    </button>

                    <div className="w-full h-40 flex items-center justify-center bg-gray-50 overflow-hidden rounded">
                      <img 
                        src={img.data} 
                        alt={img.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-2 text-center" title={img.name}>
                      {img.name}
                    </p>
                  </div>
                ))}

                {/* Add More Images Node */}
                <button 
                  onClick={() => appendInputRef.current.click()}
                  className="w-40 h-56 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-blue-500"
                >
                  <div className="bg-white rounded-full p-3 shadow-sm mb-2">
                    <Icons.SmallPlus />
                  </div>
                  <span className="text-sm font-medium">Add more</span>
                </button>
                <input 
                  type="file" 
                  ref={appendInputRef}
                  className="hidden" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />

              </div>
            </div>

            {/* Right Area: Action Sidebar */}
            <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-10">
              
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800">Image to PDF</h3>
                <Icons.Settings />
              </div>

              <div className="p-6 flex-1 text-gray-600 text-sm space-y-4">
                <p>
                  Images will be converted to a standard A4 PDF document.
                </p>
                <div className="bg-blue-50 text-blue-800 p-4 rounded text-xs leading-relaxed border border-blue-100">
                  <strong>Privacy Notice:</strong> Your files are not uploaded to any server. The PDF generation happens entirely locally within your browser.
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={convertToPdf}
                  disabled={isGenerating}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded shadow-md transition-all ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                >
                  {isGenerating ? "Converting..." : "Convert to PDF"}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Custom Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`h-2 ${modal.isError ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {modal.message}
              </p>
              <div className="flex justify-end">
                <button 
                  onClick={() => setModal({ ...modal, show: false })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}