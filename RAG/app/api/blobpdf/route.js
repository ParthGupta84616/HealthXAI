import { NextResponse } from 'next/server';
import * as pdfjs from 'pdfjs-dist';

export async function POST(request) {
    try {
        // Get the PDF Blob from the request
        const formData = await request.formData();
        const pdfBlob = formData.get('file'); // Assuming the file input field is named 'file'

        if (!pdfBlob || pdfBlob.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Invalid file format. Please upload a PDF file.' },
                { status: 400 }
            );
        }

        // Convert the Blob to an ArrayBuffer
        const arrayBuffer = await pdfBlob.arrayBuffer();

        // Load the PDF document
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        // Extract text from each page
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            text.items.forEach((item) => {
                textContent += item.str + ' ';
            });
        }

        // Return the extracted text as JSON
        return NextResponse.json({ content: textContent.trim() }, { status: 200 });
    } catch (error) {
        console.error('Error processing PDF:', error);
        return NextResponse.json(
            { error: 'Failed to process the PDF file.' },
            { status: 500 }
        );
    }
}