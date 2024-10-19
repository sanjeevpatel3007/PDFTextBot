# PDF Chatbot

This is a PDF-based chatbot built with **Next.js** and **Tailwind CSS** that takes both **PDF content** and **user text input** to generate responses. It leverages the **Google Gemini API** to provide AI-driven answers. The bot processes user queries based on the provided PDF content, text input, or both, and offers structured, clear responses for better readability.

## Key Features

- **PDF Upload**: Users can upload a PDF file to extract text for analysis.
- **Text Input**: Users can ask questions, and the chatbot responds based on the input.
- **Combined Input**: If both PDF content and user input are provided, the chatbot combines the two for a more accurate and personalized response.
- **AI-Powered**: Responses are generated using the **Google Gemini API**.
- **Clear Formatting**: The bot structures responses with headings, bullet points, and paragraphs for clarity.
- **Responsive Design**: Built with **Tailwind CSS** for mobile-friendly usage.

## Live Demo

A live demo is available at: [PDF Chatbot Live Demo](https://pdf-text-bot.vercel.app/)

## Getting Started

### Prerequisites

Before running the project, ensure you have:

- **Node.js** (version 14 or later) installed.
- A **Google Gemini API key** (for AI integration).
- **Next.js** installed (if not globally): 
  ```bash
  npm install next

##Installation
##Clone the repository:

```bash
Copy code
git clone https://github.com/sanjeevpatel3007/PDFTextBot.git
cd pdf-chatbot



##Install dependencies:

bash
npm install

##Set up environment variables:

Create a .env.local file in the project root and add your Google Gemini API key:

bash
NEXT_PUBLIC_GEMINI_API=your_google_gemini_api_key
Start the development server:

bash
npm run dev
Open your browser at http://localhost:3000 to view the application.



  
