import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, getDocs, query, orderBy } from 'firebase/firestore';
import { FiUsers, FiShoppingCart, FiCreditCard, FiLayers, FiMail, FiDollarSign } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function groupByDate(docs, field, type = 'month', isRevenue = false) {
  const result = {};
  docs.forEach(doc => {
    const date = doc[field]?.toDate ? doc[field].toDate() : new Date(doc[field]);
    if (!date) return;
    let key = '';
    if (type === 'day') key = date.toISOString().slice(0, 10);
    else if (type === 'month') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    else if (type === 'year') key = `${date.getFullYear()}`;
    if (!result[key]) result[key] = 0;
    if (isRevenue) {
      result[key] += doc.amount || 0;
    } else {
      result[key]++;
    }
  });
  return result;
}

export default function AdminStatsSection() {
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    payments: 0,
    plans: 0,
    contactRequests: 0,
    loading: true
  });
  const [charts, setCharts] = useState({
    users: { day: {}, month: {}, year: {} },
    revenue: { day: {}, month: {}, year: {} },
    payments: { day: {}, month: {}, year: {} },
    loading: true
  });

  // فلترة الفترات
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // 'day', 'month', 'year'

  useEffect(() => {
    const fetchStats = async () => {
      setStats(s => ({ ...s, loading: true }));
      try {
        const [users, payments, plans, contactRequests] = await Promise.all([
          getCountFromServer(collection(db, 'users')).then(s => s.data().count),
          getCountFromServer(collection(db, 'payments')).then(s => s.data().count),
          getCountFromServer(collection(db, 'plans')).then(s => s.data().count),
          getCountFromServer(collection(db, 'contactRequests')).then(s => s.data().count),
        ]);

        // حساب إجمالي الإيرادات من جميع المدفوعات
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        let totalRevenue = 0;
        paymentsSnapshot.forEach(doc => {
          const payment = doc.data();
          if (payment.amount) {
            totalRevenue += payment.amount;
          }
        });

        setStats({ users, revenue: totalRevenue, payments, plans, contactRequests, loading: false });
      } catch (e) {
        setStats(s => ({ ...s, loading: false }));
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCharts = async () => {
      setCharts(c => ({ ...c, loading: true }));
      try {
        // جلب بيانات المستخدمين والمدفوعات
        const [usersSnap, paymentsSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('createdAt'))),
          getDocs(query(collection(db, 'payments'), orderBy('createdAt'))),
        ]);
        const usersDocs = usersSnap.docs.map(d => d.data());
        const paymentsDocs = paymentsSnap.docs.map(d => d.data());

        // تجميع بيانات الإيرادات من جميع المدفوعات
        const revenueDocs = paymentsDocs.filter(payment => payment.amount);

        setCharts({
          users: {
            day: groupByDate(usersDocs, 'createdAt', 'day'),
            month: groupByDate(usersDocs, 'createdAt', 'month'),
            year: groupByDate(usersDocs, 'createdAt', 'year'),
          },
          revenue: {
            day: groupByDate(revenueDocs, 'createdAt', 'day', true),
            month: groupByDate(revenueDocs, 'createdAt', 'month', true),
            year: groupByDate(revenueDocs, 'createdAt', 'year', true),
          },
          payments: {
            day: groupByDate(paymentsDocs, 'createdAt', 'day'),
            month: groupByDate(paymentsDocs, 'createdAt', 'month'),
            year: groupByDate(paymentsDocs, 'createdAt', 'year'),
          },
          loading: false
        });
      } catch (e) {
        setCharts(c => ({ ...c, loading: false }));
      }
    };
    fetchCharts();
  }, []);

  const cards = [
    { label: 'عدد الحسابات', value: stats.users, icon: <FiUsers className="w-8 h-8 text-white" />, color: 'from-blue-400 to-blue-600' },
    { label: 'إجمالي الإيرادات', value: `${(stats.revenue || 0).toLocaleString()} جنيه سوداني`, icon: <FiDollarSign className="w-8 h-8 text-white" />, color: 'from-green-400 to-green-600' },
    { label: 'عدد المدفوعات', value: stats.payments, icon: <FiCreditCard className="w-8 h-8 text-white" />, color: 'from-yellow-400 to-yellow-600' },
    { label: 'عدد الخطط', value: stats.plans, icon: <FiLayers className="w-8 h-8 text-white" />, color: 'from-purple-400 to-purple-600' },
    { label: 'طلبات التواصل', value: stats.contactRequests, icon: <FiMail className="w-8 h-8 text-white" />, color: 'from-pink-400 to-pink-600' },
  ];

  function chartData(obj, label, color, isRevenue = false) {
    const labels = Object.keys(obj);
    const data = Object.values(obj);
    return {
      labels,
      datasets: [
        {
          label: isRevenue ? `${label} (جنيه سوداني)` : label,
          data,
          backgroundColor: color,
          borderColor: color,
          fill: true,
        },
      ],
    };
  }

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'day': return 'يومياً';
      case 'month': return 'شهرياً';
      case 'year': return 'سنوياً';
      default: return 'شهرياً';
    }
  };

  const getChartType = (period) => {
    return period === 'day' ? Line : Bar;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-primary">إحصائيات النظام</h2>
      
      {/* فلترة الفترات */}
      <div className="mb-8">
        <div className="flex gap-2 bg-white rounded-lg shadow p-2">
          {[
            { key: 'day', label: 'يومياً' },
            { key: 'month', label: 'شهرياً' },
            { key: 'year', label: 'سنوياً' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-4 py-2 rounded-md font-bold transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {stats.loading ? (
        <div className="text-center py-16 text-lg text-gray-500">جاري تحميل الإحصائيات...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {cards.map(card => (
            <div key={card.label} className={`rounded-xl shadow-lg p-6 flex items-center gap-4 bg-gradient-to-br ${card.color} relative overflow-hidden`}> 
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 shadow-md mr-2">{card.icon}</div>
              <div>
                <div className="text-3xl font-extrabold text-white mb-1 drop-shadow">{card.value}</div>
                <div className="text-white text-base font-bold drop-shadow">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* الشارتات */}
      {charts.loading ? (
        <div className="text-center py-12 text-gray-400">جاري تحميل الرسوم البيانية...</div>
      ) : (
        <div className="space-y-8">
          {/* شارتات حسب الفترة المختارة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-blue-700">تطور الحسابات الجديدة {getPeriodLabel(selectedPeriod)}</h3>
              {(() => {
                const ChartComponent = getChartType(selectedPeriod);
                const data = selectedPeriod === 'day' 
                  ? Object.fromEntries(Object.entries(charts.users.day).slice(-30))
                  : charts.users[selectedPeriod];
                return (
                  <ChartComponent 
                    data={chartData(data, 'الحسابات الجديدة', '#2563eb')} 
                    options={{ plugins: { legend: { display: false } } }} 
                    height={100} 
                  />
                );
              })()}
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-green-700">تطور الإيرادات {getPeriodLabel(selectedPeriod)} - جنيه سوداني</h3>
              {(() => {
                const ChartComponent = getChartType(selectedPeriod);
                const data = selectedPeriod === 'day' 
                  ? Object.fromEntries(Object.entries(charts.revenue.day).slice(-30))
                  : charts.revenue[selectedPeriod];
                return (
                  <ChartComponent 
                    data={chartData(data, 'الإيرادات', '#16a34a', true)} 
                    options={{ plugins: { legend: { display: false } } }} 
                    height={100} 
                  />
                );
              })()}
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-700">تطور المدفوعات {getPeriodLabel(selectedPeriod)}</h3>
              {(() => {
                const ChartComponent = getChartType(selectedPeriod);
                const data = selectedPeriod === 'day' 
                  ? Object.fromEntries(Object.entries(charts.payments.day).slice(-30))
                  : charts.payments[selectedPeriod];
                return (
                  <ChartComponent 
                    data={chartData(data, 'المدفوعات', '#ca8a04')} 
                    options={{ plugins: { legend: { display: false } } }} 
                    height={100} 
                  />
                );
              })()}
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-purple-700">مقارنة الإحصائيات {getPeriodLabel(selectedPeriod)}</h3>
              {(() => {
                const ChartComponent = getChartType(selectedPeriod);
                const usersData = selectedPeriod === 'day' 
                  ? Object.fromEntries(Object.entries(charts.users.day).slice(-30))
                  : charts.users[selectedPeriod];
                const revenueData = selectedPeriod === 'day' 
                  ? Object.fromEntries(Object.entries(charts.revenue.day).slice(-30))
                  : charts.revenue[selectedPeriod];
                
                const labels = Object.keys(usersData);
                return (
                  <ChartComponent 
                    data={{
                      labels,
                      datasets: [
                        {
                          label: 'الحسابات الجديدة',
                          data: Object.values(usersData),
                          backgroundColor: '#2563eb',
                          borderColor: '#2563eb',
                          yAxisID: 'y',
                        },
                        {
                          label: 'الإيرادات (جنيه سوداني)',
                          data: Object.values(revenueData),
                          backgroundColor: '#16a34a',
                          borderColor: '#16a34a',
                          yAxisID: 'y1',
                        }
                      ]
                    }}
                    options={{ 
                      plugins: { legend: { display: true } },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: {
                            drawOnChartArea: false,
                          },
                        },
                      },
                    }} 
                    height={100} 
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 