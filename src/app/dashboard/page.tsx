import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, Users, Activity } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">لوحة التحكم الرئيسية</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250,345.00 ج.س</div>
            <p className="text-xs text-muted-foreground">
              +20.1% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبيعات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات في المخزون</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +201 منذ الأسبوع الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النشاط الحالي</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 منذ الساعة الماضية
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>مرحباً بك في لوحة تحكم "مركزي للمبيعات"</CardTitle>
            <CardDescription>هذه هي واجهتك لإدارة كل ما يتعلق بنشاطك التجاري.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>من هنا يمكنك:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
                <li>إدارة منتجاتك ومخزونك بكل سهولة.</li>
                <li>تسجيل وتتبع جميع عمليات البيع.</li>
                <li>الحصول على نظرة شاملة على أداء عملك.</li>
            </ul>
            <p className="mt-4">استخدم القائمة الجانبية للتنقل بين الأقسام المختلفة.</p>
        </CardContent>
      </Card>
    </div>
  )
}
