import { jsPDF } from "jspdf";
import { PDFPort } from "../../../core/application/ports/PDFPort";

export class PDFService implements PDFPort {
    async generateBook(chapters: { title: string; content: string }[], photos: string[]): Promise<Buffer> {
        const doc = new jsPDF();

        // Title Page
        doc.setFontSize(24);
        doc.text("My Life Story", 105, 100, { align: "center" });
        doc.setFontSize(12);
        doc.text("A Biography", 105, 110, { align: "center" });

        doc.addPage();

        // Chapters
        chapters.forEach((ch, index) => {
            if (index > 0) doc.addPage();

            doc.setFontSize(18);
            doc.text(ch.title, 20, 20);

            doc.setFontSize(12);
            // Split text to fit page
            const splitText = doc.splitTextToSize(ch.content, 170);
            doc.text(splitText, 20, 40);
        });

        // Photos (Mock implementation of adding pages for photos)
        // In real app, we'd need to fetch the image data (buffer) from the URL
        if (photos.length > 0) {
            doc.addPage();
            doc.setFontSize(18);
            doc.text("Photo Album", 20, 20);
            doc.setFontSize(10);
            doc.text(`(Includes ${photos.length} photos - placeholders)`, 20, 30);
        }

        const arrayBuffer = doc.output('arraybuffer');
        return Buffer.from(arrayBuffer);
    }
}
