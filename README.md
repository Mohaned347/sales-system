# نظام مبيعاتي - نظام إدارة المبيعات المتكامل

## نظرة عامة

نظام مبيعاتي هو نظام متكامل لإدارة المبيعات والمتاجر، يوفر واجهة سهلة الاستخدام لإدارة المنتجات والمبيعات والعملاء مع نظام فترة تجريبية متقدم.

## الميزات الرئيسية

### 🚀 Landing Page
- تصميم عصري وجذاب
- عرض تفاعلي للميزات
- نموذج تسجيل سهل الاستخدام
- معلومات شاملة عن النظام

### 🔐 نظام المصادقة والفترة التجريبية
- تسجيل دخول آمن مع Firebase
- فترة تجريبية مجانية لمدة 14 يوم
- نظام أدوار متقدم (trial_user, paid_user, admin)
- تحقق تلقائي من انتهاء الفترة التجريبية
- تنبيهات ذكية قبل انتهاء الفترة التجريبية

### 📊 لوحة التحكم
- إحصائيات شاملة للمبيعات
- إدارة المنتجات والمخزون
- تسجيل وتتبع المبيعات
- إدارة العملاء (للمشتركين المدفوعين)
- تقارير وتحليلات متقدمة
- إعدادات متجر شاملة

### 💳 نظام الاشتراكات
- خطط مرنة (أساسية، متقدمة، احترافية)
- ترقية وتخفيض الخطط
- إدارة المدفوعات
- ميزات مختلفة لكل خطة

## البنية التقنية

### Frontend
- **Next.js 15** مع TypeScript
- **Tailwind CSS** للتصميم
- **Radix UI** للمكونات
- **React Hook Form** للنماذج
- **Zod** للتحقق من البيانات

### Backend & Database
- **Firebase Authentication** للمصادقة
- **Firestore** لقاعدة البيانات
- **Firebase Hosting** للنشر

### الملفات الرئيسية

```
src/
├── app/                    # صفحات Next.js
│   ├── dashboard/         # لوحة التحكم
│   ├── login/            # صفحة تسجيل الدخول
│   ├── signup/           # صفحة التسجيل
│   └── pricing/          # صفحة التسعير
├── components/
│   ├── auth/             # مكونات المصادقة
│   ├── dashboard/        # مكونات لوحة التحكم
│   ├── landing/          # مكونات الصفحة الرئيسية
│   └── trial-status/     # مكونات الفترة التجريبية
├── context/
│   └── app-context.tsx   # سياق التطبيق
├── hooks/
│   └── use-toast.ts      # hook للإشعارات
└── lib/
    └── firebase.ts       # إعدادات Firebase
```

## نظام الفترة التجريبية

### الميزات المتاحة في الفترة التجريبية
- ✅ إدارة المنتجات الأساسية
- ✅ تسجيل المبيعات
- ✅ التقارير الأساسية
- ✅ إعدادات المتجر

### الميزات المتقدمة (للمشتركين المدفوعين)
- 🔒 إدارة العملاء
- 🔒 التقارير التفصيلية
- 🔒 تحليلات متقدمة
- 🔒 تصدير البيانات
- 🔒 إشعارات متقدمة

### التحقق من الفترة التجريبية
```typescript
const { user, isTrialExpired, canAccessFeature } = useAuth()

// التحقق من انتهاء الفترة التجريبية
if (isTrialExpired()) {
  // توجيه إلى صفحة التسعير
}

// التحقق من إمكانية الوصول للميزة
if (canAccessFeature('advanced')) {
  // عرض الميزات المتقدمة
}
```

## التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب Firebase

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd sales-system
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إعداد Firebase**
   - إنشاء مشروع Firebase جديد
   - تفعيل Authentication و Firestore
   - نسخ بيانات التكوين إلى ملف `.env.local`

4. **تشغيل المشروع**
```bash
npm run dev
```

### متغيرات البيئة المطلوبة
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## هيكل قاعدة البيانات

### مجموعة `users`
```typescript
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  storeName: string,
  role: 'trial_user' | 'paid_user' | 'admin',
  subscriptionStatus: 'trial' | 'paid' | 'expired',
  trialStartDate: Timestamp,
  trialEndDate: Timestamp,
  storeData: {
    storeName: string,
    storeAddress: string,
    storePhone: string,
    storeWebsite: string,
    currency: string,
    language: string
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### مجموعة `stores`
```typescript
{
  storeName: string,
  ownerId: string,
  ownerName: string,
  phone: string,
  email: string,
  subscription: {
    status: 'trial' | 'paid',
    plan: 'basic' | 'advanced' | 'premium',
    startDate: Timestamp,
    endDate: Timestamp,
    isActive: boolean
  },
  createdAt: Timestamp,
  isActive: boolean
}
```

## الأمان

- مصادقة آمنة مع Firebase
- تحقق من الأدوار والصلاحيات
- حماية الصفحات حسب نوع الاشتراك
- تشفير البيانات الحساسة

## النشر

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
vercel --prod
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. إنشاء Pull Request

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني
- مراجعة الوثائق

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

**تم تطوير هذا النظام بواسطة فريق مبيعاتي** 🚀
