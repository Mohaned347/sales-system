'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PaymentInvoiceProps {
  payment: {
    id: string;
    planName: string;
    amount: number;
    bankName: string;
    bankAccount: string;
    transactionId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    createdAt: any;
  };
  onClose: () => void;
}

export default function PaymentInvoice({ payment, onClose }: PaymentInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'غير محدد';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB');
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${payment.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b no-print">
          <h2 className="text-2xl font-bold text-gray-800">فاتورة الدفع</h2>
          <div className="flex gap-2">
            <Button onClick={printInvoice} variant="outline" size="sm">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={generatePDF} variant="outline" size="sm">
              <Download className="w-4 h-4 ml-2" />
              تحميل PDF
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              إغلاق
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="p-8 bg-white invoice-container invoice-print">
          {/* Company Header */}
          <div className="invoice-header">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MONTI GO SDN</h1>
            <p className="text-lg text-gray-600 mb-1">Sales Management System</p>
            <p className="text-sm text-gray-500">نظام إدارة المبيعات</p>
            <p className="text-sm text-gray-500 mt-2">فاتورة دفع رسمية</p>
          </div>

          {/* Invoice Details */}
          <div className="invoice-details">
            {/* Invoice Info */}
            <div className="invoice-section">
              <h3>تفاصيل الفاتورة</h3>
              <div className="space-y-2">
                <div className="invoice-row">
                  <span className="invoice-label">رقم الفاتورة:</span>
                  <span className="invoice-value">{payment.id}</span>
                </div>
                <div className="invoice-row">
                  <span className="invoice-label">تاريخ الإصدار:</span>
                  <span className="invoice-value">{formatDate(payment.createdAt)}</span>
                </div>
                <div className="invoice-row">
                  <span className="invoice-label">الخطة:</span>
                  <span className="invoice-value">{payment.planName}</span>
                </div>
                <div className="invoice-row">
                  <span className="invoice-label">المبلغ:</span>
                  <span className="invoice-amount">{payment.amount} جنيه سوداني</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="invoice-section">
              <h3>بيانات العميل</h3>
              <div className="space-y-2">
                <div className="invoice-row">
                  <span className="invoice-label">الاسم:</span>
                  <span className="invoice-value">{payment.userName}</span>
                </div>
                <div className="invoice-row">
                  <span className="invoice-label">البريد الإلكتروني:</span>
                  <span className="invoice-value">{payment.userEmail}</span>
                </div>
                <div className="invoice-row">
                  <span className="invoice-label">الهاتف:</span>
                  <span className="invoice-value">{payment.userPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <div className="invoice-section">
              <h3>تفاصيل الدفع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">بيانات البنك</h4>
                  <div className="space-y-2">
                    <div className="invoice-row">
                      <span className="invoice-label">اسم البنك:</span>
                      <span className="invoice-value">{payment.bankName}</span>
                    </div>
                    <div className="invoice-row">
                      <span className="invoice-label">رقم الحساب:</span>
                      <span className="invoice-value font-mono">{payment.bankAccount}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">تفاصيل التحويل</h4>
                  <div className="space-y-2">
                    <div className="invoice-row">
                      <span className="invoice-label">رقم العملية:</span>
                      <span className="invoice-value font-mono">{payment.transactionId}</span>
                    </div>
                    <div className="invoice-row">
                      <span className="invoice-label">المبلغ المحول:</span>
                      <span className="invoice-amount">{payment.amount} جنيه سوداني</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="invoice-footer">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">شكراً لثقتكم في خدماتنا</p>
                <p className="text-sm text-gray-600">سيتم تفعيل حسابكم بعد التأكد من الدفع</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">المجموع: {payment.amount} جنيه سوداني</p>
                <p className="text-sm text-gray-600">شامل جميع الضرائب</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">MONTI GO SDN - Sales Management System</p>
            <p className="text-xs text-gray-500">جميع الحقوق محفوظة © 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
} 