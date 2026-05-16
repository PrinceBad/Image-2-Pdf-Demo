# Image2PDF Converter 📄✨

A fast, secure, and purely client-side React application that converts your images into a single PDF document. Inspired by clean, modern tools like iLovePDF, but built to run entirely in your browser with zero server uploads required.

## 🚀 Features

* **100% Secure & Private:** Files are processed locally on your device. No images are ever uploaded to a remote server.
* **Drag and Drop Interface:** Easily drag and drop multiple images to add them to your workspace.
* **Preview & Manage:** View thumbnails of your uploaded images and remove any you don't want included in the final document.
* **Fast Generation:** Uses `jsPDF` to compile images into a standard A4 PDF document instantly.
* **Modern UI:** Clean, responsive design built with Tailwind CSS.

## 🛠️ Tech Stack

* **Framework:** React (via Vite)
* **Styling:** Tailwind CSS
* **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) (Loaded dynamically via CDN)
* **Deployment:** Vercel

## 💻 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/image-to-pdf.git](https://github.com/YOUR_USERNAME/image-to-pdf.git)
   cd image-to-pdf
