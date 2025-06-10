import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function GET(req) {
    try {
        // Extract the file name from the query parameter (e.g., /api/blobpdf?file=nike.pdf)
        const { searchParams } = new URL(req.url);
        const fileName = searchParams.get("file");

        if (!fileName) {
            return new Response(JSON.stringify({ error: 'File name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Load the PDF dynamically based on the provided file name
        const loader = new PDFLoader(`public/${fileName}`);
        const docs = await loader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const splits = await textSplitter.splitDocuments(docs);

        // Extract the text content only from the documents, discarding metadata or other parts
        const content = splits.map(split => split.pageContent);

        // Return the content in JSON format
        return new Response(JSON.stringify({ text: content }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
