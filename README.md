# Credit Card Statement Parser

A powerful web application that extracts financial data from credit card PDF statements using AI-powered OCR technology. Built with Next.js and OCR.space API for accurate data extraction from multiple bank formats.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tps-projects-21726f9c/v0-extract-data-from-pdf)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/1w1cOVMlEEq)

## Features

- **AI-Powered OCR**: Uses OCR.space API for high-accuracy text extraction from PDF statements
- **Multi-Bank Support**: Works with statements from ICICI, HDFC, Axis, RBL, Yes Bank, and more
- **Batch Processing**: Upload and process multiple statements simultaneously
- **Smart Data Extraction**: Automatically extracts:
  - Customer name
  - Card issuer and last 4 digits
  - Billing cycle dates
  - Payment due date
  - Total amount due
  - Minimum payment due
  - Credit limit
  - Available credit
- **Multiple Export Formats**: Download extracted data as JSON, CSV, or raw text
- **Real-time Progress**: Visual feedback during PDF processing
- **Manual Editing**: Edit extracted data before exporting
- **Dark Mode Support**: Built-in theme switching

## Tech Stack

- **Framework**: Next.js 15.2.4 (React 19)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **OCR**: OCR.space API
- **PDF Processing**: PDF.js
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OCR.space API key (get one at [ocr.space](https://ocr.space/ocrapi))

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/Sharans23/cc-ocr.git
cd cc-ocr
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file in the root directory:
\`\`\`env
API_KEY=your_api_key_here
\`\`\`

4. Configure OCR API:
\`\`\`javascript
const API_KEY = 'your_ocr_space_api_key';
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Single Statement Processing

1. Click "Choose PDF File" or drag and drop a PDF statement
2. Wait for the OCR processing to complete
3. Review the extracted data
4. Edit any fields if needed by clicking the "Edit" button
5. Export the data in your preferred format (JSON, CSV, or raw text)

### Batch Processing

1. Click "Batch Upload" button
2. Select multiple PDF files
3. Wait for all files to be processed
4. Review the batch results summary
5. Export all results to a single CSV file

## Project Structure

\`\`\`
cc-ocr/
├── app/
│   ├── layout.jsx          # Root layout with theme provider
│   ├── page.jsx            # Main application page
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── extracted-data-display.jsx  # Display and edit extracted data
│   ├── file-upload.jsx     # File upload with drag-and-drop
│   └── raw-ocr-output.jsx  # Display raw OCR text
├── lib/
│   ├── constants/
│   │   └── extraction-patterns.js  # Regex patterns for data extraction
│   ├── services/
│   │   ├── pdf-processor.js        # PDF to text conversion
│   │   └── data-extractor.js       # Extract structured data from text
│   └── utils/
│       ├── file-utils.js           # Export utilities (JSON, CSV, text)
│       ├── image-processing.js     # Image preprocessing for OCR
│       └── text-processing.js      # Text cleaning and normalization
└── public/                 # Static assets
\`\`\`

## How It Works

1. **PDF Upload**: User uploads a credit card statement PDF
2. **PDF Processing**: PDF.js converts PDF pages to images
3. **Image Preprocessing**: Images are enhanced for better OCR accuracy
4. **OCR Extraction**: OCR.space API extracts text from images
5. **Data Parsing**: Generic extraction logic identifies and extracts key financial data
6. **Display & Edit**: User can review and edit extracted data
7. **Export**: Data can be exported in multiple formats

## Supported Banks

The parser uses generic extraction patterns that work with most credit card statements, including:

- ICICI Bank
- HDFC Bank
- Axis Bank
- RBL Bank
- Yes Bank
- And many more

## API Configuration

### OCR.space API

The application uses OCR.space API with the following configuration:
- Engine: OCR Engine 2 (enhanced accuracy)
- Language: English
- Features: Scale detection, table detection, orientation detection

To get your own API key:
1. Visit [ocr.space/ocrapi](https://ocr.space/ocrapi)
2. Sign up for a free account
3. Copy your API key
4. Update the key in `lib/services/pdf-processor.js`


## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

