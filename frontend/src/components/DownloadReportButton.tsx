import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface DownloadReportButtonProps {
  complaint: any;
}

const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({ complaint }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFillColor(30, 58, 138); // Primary color
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('CivicShield', 14, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Complaint Report', pageWidth - 14, 25, { align: 'right' });
      
      let yPos = 50;
      
      // Basic Info
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Complaint Details', 14, yPos);
      
      yPos += 10;
      
      const createdDate = complaint.created_at ? format(new Date(complaint.created_at), 'dd MMM yyyy, h:mm a') : 'Unknown';
      
      const sanitizeText = (text: string) => {
        if (!text) return 'Not provided';
        // Keep only standard ASCII characters to prevent PDF generation gibberish
        const cleaned = text.replace(/[^\x00-\x7F]/g, '').replace(/,\s*,/g, ',').trim();
        // If the string was mostly non-English (e.g. Tamil) and got stripped
        if (cleaned.length < 5 && text.length > 5) {
          if (complaint.latitude && complaint.longitude) {
            return `Coordinates: ${complaint.latitude}, ${complaint.longitude}`;
          }
          return 'Location provided in unsupported language format.';
        }
        // Remove leading commas if they were left over
        return cleaned.replace(/^,\s*/, '') || 'Not provided';
      };

      const safeLocation = sanitizeText(complaint.human_readable_address || complaint.location);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Field', 'Information']],
        body: [
          ['Tracking ID', complaint.tracking_id || `ID: ${complaint.id}`],
          ['Title', complaint.title || 'Untitled'],
          ['Status', (complaint.status || 'UNKNOWN').replace(/_/g, ' ')],
          ['Category', complaint.category || 'Not specified'],
          ['Priority', complaint.final_priority || complaint.ai_priority || 'LOW'],
          ['Date Submitted', createdDate],
          ['Location', safeLocation]
        ],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Description
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitDesc = doc.splitTextToSize(complaint.description || 'No description provided.', pageWidth - 28);
      doc.text(splitDesc, 14, yPos);
      
      yPos += (splitDesc.length * 5) + 10;
      
      // Check page break
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Timeline (History)
      if (complaint.history && complaint.history.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Status History', 14, yPos);
        
        yPos += 8;
        
        const historyData = complaint.history.map((h: any) => [
          format(new Date(h.created_at), 'dd MMM yyyy, h:mm a'),
          h.old_status ? h.old_status.replace(/_/g, ' ') : 'N/A',
          h.new_status.replace(/_/g, ' '),
          h.note || 'Status updated'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'From', 'To', 'Notes']],
          body: historyData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 9 }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // AI Analysis
      if (complaint.ai_summary || complaint.ai_department) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Analysis Insights', 14, yPos);
        yPos += 8;
        
        const aiBody = [];
        if (complaint.ai_summary) aiBody.push(['Summary', complaint.ai_summary]);
        if (complaint.ai_department) aiBody.push(['Suggested Dept', complaint.ai_department]);
        if (complaint.ai_next_action) aiBody.push(['Next Action', complaint.ai_next_action]);
        
        autoTable(doc, {
          startY: yPos,
          body: aiBody,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 4 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] } }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Feedback
      if (complaint.feedback) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Citizen Feedback', 14, yPos);
        yPos += 8;
        
        autoTable(doc, {
          startY: yPos,
          body: [
            ['Rating', `${complaint.feedback.rating} / 5 Stars`],
            ['Resolved Confirmed', complaint.feedback.resolved_confirmed ? 'Yes' : 'No'],
            ['Comment', complaint.feedback.comment || 'None provided']
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 4 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] } }
        });
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Generated by CivicShield on ${format(new Date(), 'dd MMM yyyy, h:mm a')}`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
      }
      
      doc.save(`${complaint.tracking_id || 'complaint'}_report.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm text-slate-700 dark:text-slate-300 disabled:opacity-50"
    >
      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Download PDF Report
    </button>
  );
};

export default DownloadReportButton;
