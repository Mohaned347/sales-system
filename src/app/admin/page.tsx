"use client";

import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FiUsers, FiCreditCard, FiLayers, FiClock, FiMail, FiBarChart2, FiStar } from "react-icons/fi";
import AccountsSection from "./accounts-section";
import PaymentsSection from "./payments-section";
import PlansSection from "./plans-section";
import SettingsSection from "./settings-section";
import AdminStatsSection from "./stats-section";
import TrialSettingsSection from "./trial-settings-section";
import ContactRequestsSection from "./contact-requests-section";
import PaymentAdminSection from "./payment-admin-section";
import TestimonialsSection from "./testimonials-section";
import { useAuth } from '@/components/auth/auth-provider';

const sections = [
  { id: "stats", label: "الإحصائيات", icon: <FiBarChart2 /> },
  { id: "accounts", label: "الحسابات", icon: <FiUsers /> },
  { id: "payments", label: "المدفوعات", icon: <FiCreditCard /> },
  { id: "plans", label: "الخطط", icon: <FiLayers /> },
  { id: "trial-settings", label: "إعدادات الفترة التجريبية", icon: <FiClock /> },
  { id: "contact-requests", label: "طلبات التواصل", icon: <FiMail /> },
  { id: "testimonials", label: "التقييمات", icon: <FiStar /> },
  { id: "payment-admin", label: "إعدادات الدفع والبنوك", icon: <FiCreditCard /> },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("accounts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!user || user.role !== 'admin') {
    return <div className="text-center py-20 text-red-600 font-bold text-xl">غير مصرح لك بالدخول إلى هذه الصفحة</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
        <span></span>
        <h2 className="text-xl font-bold text-primary">لوحة الإدارة</h2>
        <button onClick={() => setSidebarOpen(true)} className="text-primary text-2xl"><FiMenu /></button>
      </div>
      <div className="flex flex-1">
        {/* Sidebar - ثابت على الجانب */}
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:right-0 md:w-64 bg-white shadow-lg py-8 px-4 border-r border-gray-200 z-40 overflow-y-auto" style={{ maxHeight: '100vh' }}>
          <h2 className="text-2xl font-bold mb-8 text-center text-primary">لوحة الإدارة</h2>
          <nav className="flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right text-lg font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-white shadow"
                    : "text-gray-700 hover:bg-primary/10"
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Sidebar - slides from right on mobile */}
        <aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-white shadow-lg flex flex-col py-8 px-4 border-r border-gray-200 transform transition-transform duration-200 md:hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`} style={{ maxHeight: '100vh' }}>
          <div className="flex items-center justify-between mb-8 md:hidden">
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 text-2xl"><FiX /></button>
            <h2 className="text-xl font-bold text-primary">لوحة الإدارة</h2>
            <span></span>
          </div>
          <nav className="flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right text-lg font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-white shadow"
                    : "text-gray-700 hover:bg-primary/10"
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 md:mr-64">
          {activeSection === "stats" && <AdminStatsSection />}
          {activeSection === "accounts" && <AccountsSection />}
          {activeSection === "payments" && <PaymentsSection />}
          {activeSection === "plans" && <PlansSection />}
          {activeSection === "trial-settings" && <TrialSettingsSection />}
          {activeSection === "contact-requests" && <ContactRequestsSection />}
          {activeSection === "testimonials" && <TestimonialsSection />}
          {activeSection === "payment-admin" && <PaymentAdminSection />}
        </main>
      </div>
    </div>
  );
}