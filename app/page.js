"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const messagesEndRef = useRef(null); 

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const pdfText = await extractTextFromPDF(file);
      setPdfText(pdfText);
      setPdfFileName(file.name);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const extractTextFromPDF = async (file) => {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      text += pageText + '\n\n';
    }

    return text.trim();
  };

  const handleSendClick = async () => {
    if (!inputValue && !pdfText) {
      alert("Please enter a question or upload a PDF.");
      return;
    }


    const prompt = "Please answer the user question based on both the provided PDF content and the user's input. Prioritize using the user's input to tailor the response for greater relevance. Ensure that the response is concise, clear, and structured with appropriate headings, bullet points, and paragraphs for better readability. If PDF content is not available, base the response solely on the user input.";
    // const prompt = "Based on the provided PDF content, please answer the user question concisely and clearly. Ensure that the response is structured with appropriate headings, bullet points, and paragraphs for clarity. If the PDF content is not available, base your response solely on the user input.";
    const combinedText = `${prompt}\n\nUser Input: ${inputValue}\n\nPDF Content: ${pdfText}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: combinedText,
            },
          ],
        },
      ],
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", text: inputValue || "Uploaded PDF content." }
    ]);

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        const aiResponse = data.candidates[0].content.parts[0].text;



        // response formate 
        const formattedResponse = formatAIResponse(aiResponse);

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", text: formattedResponse }
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", text: 'No valid response received' }
        ]);
      }

      setInputValue('');
      setPdfFileName('');
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", text: 'Failed to fetch the response' }
      ]);
    } finally {
      setIsLoading(false); 
    }
  };

  const formatAIResponse = (response) => {
    return response
      .replace(/(\*\*(.*?)\*\*)/g, '<strong>$2</strong>') 
      .replace(/(\*(.*?)\*)/g, '<em>$2</em>') 
      .replace(/#+\s*(.*)/g, '<strong>$1</strong>') 
      .replace(/\n/g, '<br />')
      .replace(/(\*\*|\*|#)/g, ''); 
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#E2F1E7]"> 
      <div className="flex-grow overflow-y-auto p-4 bg-white relative">
        {messages.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-4xl font-bold text-[#243642]">
              Welcome to PDFTextBot
            </h2>
            <p className="text-lg text-[#387478]">
              Start by typing a question or uploading a PDF to begin!
            </p>
          </div>
        )}

        <div className="flex justify-center items-center">
          <div className="fixed top-0 bg-[#387478] shadow-lg rounded-xl mt-12 py-3 px-6">
            <h1 className="text-2xl font-bold text-[#E2F1E7]">PDFTextBot</h1>
          </div>
        </div>



        <div className="space-y-4 mt-16">
          {messages.map((message, index) => (
            <div key={index} className={`p-3 rounded-md ${message.type === "user" ? "self-end bg-[#243642] text-white" : "self-start bg-[#629584] text-gray-900"}`}>
              <strong>{message.type === "user" ? "You:" : "Gemini AI:"}</strong>
              <p dangerouslySetInnerHTML={{ __html: message.text }} />
            </div>
          ))}
          {isLoading && ( 
            <div className="p-3 rounded-md bg-gray-300 text-gray-900">
              <strong>Gemini AI:</strong> Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-300">
        <div className="flex items-center">
          {pdfFileName && (
            <span className="mr-4 text-[#243642] bg-[#E2F1E7] rounded-md p-2">
              {pdfFileName}
            </span>
          )}

          <label htmlFor="pdf-upload" className="cursor-pointer flex items-center bg-[#387478] text-white py-2 px-4 rounded-lg hover:bg-[#243642] mr-2">
            <img src="/pdf.png" alt="Upload PDF" className="w-5 h-5 mr-2" />
            PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />

          <input
            type="text"
            onChange={handleInputChange}
            value={inputValue}
            className="border rounded-lg w-full p-2 mr-2"
            placeholder="Type your question here..."
          />

          <button onClick={handleSendClick} className="bg-[#387478] text-white py-2 px-4 rounded-lg hover:bg-[#243642]">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
