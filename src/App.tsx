import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Wrench, Settings, Activity, Users, 
  Search, Bell, X, Plus, QrCode, 
  CheckCircle, Clock, BarChart3, ArrowRight, Play, Pause, CheckSquare,
  Thermometer, Zap, ShieldAlert, Cpu, Package, FileText, History, Wrench as WrenchIcon
} from 'lucide-react';

// --- TYPES & INTERFACES ---
type Role = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'OPERATOR';

interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

interface Asset {
  id: string;
  code: string;
  name: string;
  location: string;
  status: 'RUNNING' | 'STOPPED' | 'FAULT' | 'MAINTENANCE';
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  healthScore: number;
  specs: string;
}

interface WorkOrder {
  id: string;
  title: string;
  assetId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
  assignedTo?: string;
  createdAt: string;
  timerSeconds: number;
  isTimerRunning: boolean;
}

interface Part {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
}

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Ahmet Yılmaz', role: 'TECHNICIAN' },
  { id: 'u2', name: 'Ayşe Kaya', role: 'MANAGER' },
  { id: 'u3', name: 'Mehmet Demir', role: 'OPERATOR' }
];

const MOCK_ASSETS: Asset[] = [
  { id: 'a1', code: 'MTR-01', name: 'Ana Konveyör Motoru', location: 'Hat 1', status: 'RUNNING', criticality: 'HIGH', healthScore: 88, specs: '15kW, 1450 RPM, 400V AC, Delta Inverter Driven' },
  { id: 'a2', code: 'CNC-04', name: 'CNC Torna Tezgahı', location: 'İmalat', status: 'FAULT', criticality: 'HIGH', healthScore: 45, specs: 'Siemens Sinumerik 840D sl, 5 Eksen' },
  { id: 'a3', code: 'PMP-12', name: 'Soğutma Pompası', location: 'Tesisat', status: 'MAINTENANCE', criticality: 'MEDIUM', healthScore: 60, specs: 'Santrifüj, 5.5kW, 30m3/h' },
  { id: 'a4', code: 'RBT-02', name: 'Kaynak Robotu', location: 'Enko Hat 2', status: 'RUNNING', criticality: 'HIGH', healthScore: 95, specs: '6 Eksen, 15kg Payload' },
];

const MOCK_WOS: WorkOrder[] = [
  { id: 'WO-26-001', title: 'CNC Eksen Hatası', assetId: 'a2', priority: 'CRITICAL', status: 'NEW', createdAt: new Date().toISOString(), timerSeconds: 0, isTimerRunning: false },
  { id: 'WO-26-002', title: 'Pompa Rulman Değişimi', assetId: 'a3', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 'u1', createdAt: new Date(Date.now() - 86400000).toISOString(), timerSeconds: 3600, isTimerRunning: false },
];

const MOCK_PARTS: Part[] = [
  { id: 'p1', code: 'SKF-6205', name: 'Rulman 6205 2RS', category: 'Mekanik', stock: 12, minStock: 5, unit: 'Adet' },
  { id: 'p2', code: 'SIE-3RT', name: 'Kontaktör 3RT2015', category: 'Elektrik', stock: 3, minStock: 10, unit: 'Adet' },
  { id: 'p3', code: 'SICK-WTB', name: 'Fotoelektrik Sensör WTB4', category: 'Otomasyon', stock: 8, minStock: 5, unit: 'Adet' },
  { id: 'p4', code: 'FST-QSM', name: 'Pnömatik Rakor QSM-M5', category: 'Pnömatik', stock: 45, minStock: 20, unit: 'Adet' },
];

// --- CORE APP STATE & CONTEXT ---
const AppContext = React.createContext<any>(null);

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WOS);
  const [parts, setParts] = useState<Part[]>(MOCK_PARTS);
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'ASSETS' | 'WORK_ORDERS' | 'REPORT_FAILURE' | 'WO_DETAIL' | 'ASSET_DETAIL' | 'INVENTORY'>('DASHBOARD');
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const contextValue = {
    currentUser, setCurrentUser,
    assets, setAssets,
    workOrders, setWorkOrders,
    parts, setParts,
    currentView, setCurrentView,
    selectedWO, setSelectedWO,
    selectedAsset, setSelectedAsset,
    navigate: (view: any, payload?: any) => {
      if (view === 'WO_DETAIL') setSelectedWO(payload);
      if (view === 'ASSET_DETAIL') setSelectedAsset(payload);
      setCurrentView(view);
    }
  };

  if (!currentUser) return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-amber-500 selection:text-black flex flex-col md:flex-row overflow-hidden">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
          <TopNavigation />
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {currentView === 'DASHBOARD' && <Dashboard />}
            {currentView === 'ASSETS' && <AssetList />}
            {currentView === 'ASSET_DETAIL' && <AssetDetail />}
            {currentView === 'WORK_ORDERS' && <WorkOrderList />}
            {currentView === 'REPORT_FAILURE' && <ReportFailure />}
            {currentView === 'WO_DETAIL' && <WorkOrderDetail />}
            {currentView === 'INVENTORY' && <InventoryList />}
          </div>
        </main>
        <MobileNav />
      </div>
    </AppContext.Provider>
  );
}

// --- NAVIGATION COMPONENTS ---

function Sidebar({ className = "" }: { className?: string }) {
  const { navigate, currentView, currentUser } = React.useContext(AppContext);
  
  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
    { id: 'WORK_ORDERS', label: 'İş Emirleri', icon: Wrench },
    { id: 'ASSETS', label: 'Ekipmanlar', icon: Settings },
    { id: 'INVENTORY', label: 'Yedek Parça', icon: Package },
  ];

  return (
    <aside className={`w-64 bg-[#141414] border-r border-neutral-800 flex-col h-screen ${className}`}>
      {/* Logo Buraya Eklendi */}
      <div className="p-6 flex items-center space-x-3">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-md" />
        <span className="text-lg font-bold tracking-wider text-white">MAINTENANCE</span>
      </div>
      <div className="px-4 py-6 border-b border-neutral-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{currentUser.name}</p>
            <p className="text-xs text-neutral-500">{currentUser.role}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileNav() {
  const { navigate, currentView } = React.useContext(AppContext);
  
  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-neutral-800 px-6 py-2 flex items-center justify-between z-50">
        <button onClick={() => navigate('DASHBOARD')} className={`flex flex-col items-center p-2 ${currentView === 'DASHBOARD' ? 'text-amber-500' : 'text-neutral-500'}`}>
          <Activity size={20} />
          <span className="text-[10px] mt-1 font-medium">Özet</span>
        </button>
        <button onClick={() => navigate('WORK_ORDERS')} className={`flex flex-col items-center p-2 ${currentView === 'WORK_ORDERS' ? 'text-amber-500' : 'text-neutral-500'}`}>
          <Wrench size={20} />
          <span className="text-[10px] mt-1 font-medium">İşler</span>
        </button>
        <div className="w-12"></div>
        <button onClick={() => navigate('ASSETS')} className={`flex flex-col items-center p-2 ${currentView === 'ASSETS' ? 'text-amber-500' : 'text-neutral-500'}`}>
          <Settings size={20} />
          <span className="text-[10px] mt-1 font-medium">Ekipman</span>
        </button>
        <button onClick={() => navigate('INVENTORY')} className={`flex flex-col items-center p-2 ${currentView === 'INVENTORY' ? 'text-amber-500' : 'text-neutral-500'}`}>
          <Package size={20} />
          <span className="text-[10px] mt-1 font-medium">Stok</span>
        </button>
      </div>
      <button 
        onClick={() => navigate('REPORT_FAILURE')}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-amber-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 z-50 active:scale-95 transition-transform"
      >
        <Plus size={28} />
      </button>
    </>
  );
}

function TopNavigation() {
  return (
    <header className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between">
      {/* Logo Buraya Eklendi (Mobil) */}
      <div className="flex items-center md:hidden">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg mr-3 shadow-sm" />
        <span className="font-bold tracking-wider text-white">MAINTENANCE</span>
      </div>
      <div className="hidden md:flex items-center text-neutral-400 text-sm">
        <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-neutral-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
        </button>
        <button className="text-neutral-400 hover:text-white transition-colors">
          <Search size={20} />
        </button>
      </div>
    </header>
  );
}

// --- SHARED COMPONENTS ---

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-[#141414] p-8 rounded-2xl border border-neutral-800 shadow-2xl">
        <div className="text-center">
          {/* Logo Buraya Eklendi */}
          <img 
            src="/logo.png" 
            alt="Maintenance Logo" 
            className="w-32 h-32 mx-auto rounded-[2rem] shadow-lg shadow-black/50 mb-6"
          />
          <p className="text-neutral-500 mt-2 text-sm uppercase tracking-widest">Industrial Platform</p>
        </div>
        <div className="space-y-4 pt-6">
          <p className="text-sm text-neutral-400 text-center mb-4">Giriş yapmak için rol seçin (Demo)</p>
          {MOCK_USERS.map(user => (
            <button key={user.id} onClick={() => onLogin(user)} className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-colors">
                  <Users size={18} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-200">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.role}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-neutral-600 group-hover:text-amber-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colorMap: Record<string, string> = {
    red: 'text-red-500 bg-red-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
  };
  return (
    <div className="bg-[#141414] p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon size={16} /></div>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white">{value}</h3>
    </div>
  );
}

// --- NEW VIEWS (Asset Detail & Inventory) ---

function AssetDetail() {
  const { selectedAsset, navigate, workOrders } = React.useContext(AppContext);
  const asset: Asset = selectedAsset;
  const assetWOs = workOrders.filter((wo: WorkOrder) => wo.assetId === asset.id);

  if (!asset) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center space-x-3 mb-2">
        <button onClick={() => navigate('ASSETS')} className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800">
          <ArrowRight size={20} className="rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            {asset.code} - {asset.name}
          </h1>
          <p className="text-sm text-neutral-400">{asset.location}</p>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141414] p-4 rounded-xl border border-neutral-800 flex items-center space-x-4">
           <div className={`w-3 h-3 rounded-full ${asset.status === 'RUNNING' ? 'bg-emerald-500' : asset.status === 'FAULT' ? 'bg-red-500' : 'bg-amber-500'} shadow-[0_0_10px_currentColor]`} />
           <div>
             <p className="text-xs text-neutral-500 uppercase">Mevcut Durum</p>
             <p className="font-bold text-white">{asset.status}</p>
           </div>
        </div>
        <div className="bg-[#141414] p-4 rounded-xl border border-neutral-800 flex items-center space-x-4">
           <Activity className="text-blue-500" size={24} />
           <div>
             <p className="text-xs text-neutral-500 uppercase">Sağlık Skoru</p>
             <p className="font-bold text-white">{asset.healthScore} / 100</p>
           </div>
        </div>
        <div className="col-span-2 flex space-x-3">
           <button onClick={() => navigate('REPORT_FAILURE')} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl flex items-center justify-center font-semibold transition-colors">
             <AlertTriangle size={18} className="mr-2" /> Arıza Bildir
           </button>
           <button className="flex-1 bg-amber-500 text-black rounded-xl flex items-center justify-center font-semibold hover:bg-amber-400 transition-colors">
             <QrCode size={18} className="mr-2" /> Etiket Okut
           </button>
        </div>
      </div>

      {/* Tabs / Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141414] p-6 rounded-xl border border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center"><FileText size={16} className="mr-2" /> Teknik Özellikler</h3>
            <p className="text-neutral-300 font-mono text-sm leading-relaxed">{asset.specs}</p>
          </div>
          
          <div className="bg-[#141414] p-6 rounded-xl border border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center"><History size={16} className="mr-2" /> Bakım Geçmişi (Son İşler)</h3>
            <div className="space-y-3">
              {assetWOs.length > 0 ? assetWOs.map((wo: WorkOrder) => (
                <div key={wo.id} className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <div>
                    <p className="font-medium text-neutral-200">{wo.title}</p>
                    <p className="text-xs text-neutral-500 mt-1">{new Date(wo.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${wo.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {wo.status}
                  </span>
                </div>
              )) : (
                <p className="text-neutral-500 text-sm">Bu makine için kayıtlı iş emri bulunamadı.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#141414] p-6 rounded-xl border border-neutral-800">
             <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">IoT Sensör Verileri</h3>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-neutral-400">Sıcaklık</span>
                   <span className="text-amber-500 font-bold">42°C</span>
                 </div>
                 <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500" style={{ width: '42%' }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-neutral-400">Titreşim (RMS)</span>
                   <span className="text-emerald-500 font-bold">1.2 mm/s</span>
                 </div>
                 <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{ width: '15%' }}></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryList() {
  const { parts } = React.useContext(AppContext);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
         <div>
           <h1 className="text-2xl font-bold text-white">Yedek Parça Stoğu</h1>
           <p className="text-sm text-neutral-400 mt-1">Depo ve envanter durumu</p>
         </div>
         <button className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg font-medium transition-colors hidden md:block">
           + Yeni Parça Ekle
         </button>
      </div>

      <div className="bg-[#141414] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center space-x-4">
           <div className="relative flex-1">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
             <input type="text" placeholder="Parça kodu veya adı ara..." className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />
           </div>
           <button className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white"><Settings size={18} /></button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-900/50 text-neutral-500 uppercase tracking-wider text-xs border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Parça Kodu</th>
                <th className="px-6 py-4 font-medium">Tanım</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Mevcut Stok</th>
                <th className="px-6 py-4 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {parts.map((part: Part) => {
                const isLowStock = part.stock <= part.minStock;
                return (
                  <tr key={part.id} className="hover:bg-neutral-900/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-neutral-300">{part.code}</td>
                    <td className="px-6 py-4 font-medium text-white">{part.name}</td>
                    <td className="px-6 py-4 text-neutral-400">{part.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-emerald-500'}`}>{part.stock}</span>
                        <span className="text-neutral-500 ml-1 text-xs">{part.unit}</span>
                        {isLowStock && <AlertTriangle size={14} className="text-red-500 ml-2" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-amber-500 text-sm font-medium hover:underline">Sipariş Geç</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- EXISTING VIEWS ---

function Dashboard() {
  const { currentUser, navigate } = React.useContext(AppContext);
  const isTech = currentUser.role === 'TECHNICIAN';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hoş Geldin, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {isTech ? "Bugün sana atanan işleri aşağıda görebilirsin." : "Fabrika bakım özetine göz atın."}
          </p>
        </div>
        <button onClick={() => navigate('REPORT_FAILURE')} className="hidden md:flex bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg items-center font-medium transition-colors">
          <AlertTriangle size={18} className="mr-2" /> Arıza Bildir
        </button>
      </div>
      {isTech ? <TechnicianDashboard /> : <ManagerDashboard />}
    </div>
  );
}

function TechnicianDashboard() {
  const { workOrders, navigate } = React.useContext(AppContext);
  
  // ÇÖZÜM: 'COMPLETED' olanları da filtreleyerek ekrandan kaybolmasını sağlıyoruz
  const myOrders = workOrders.filter((wo: WorkOrder) => wo.status === 'NEW' || wo.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Açık İşlerim" value={myOrders.length} icon={WrenchIcon} color="blue" />
        <StatCard title="Kritik Arızalar" value={myOrders.filter((w: WorkOrder) => w.priority === 'CRITICAL').length} icon={AlertTriangle} color="red" />
        <StatCard title="Bugünkü Planlı" value="2" icon={CheckSquare} color="amber" />
        <StatCard title="Geciken" value="0" icon={Clock} color="emerald" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:hidden">
        <button onClick={() => navigate('REPORT_FAILURE')} className="bg-[#141414] border border-neutral-800 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-neutral-900 active:scale-95 transition-all">
          <QrCode className="text-amber-500" size={24} />
          <span className="text-sm font-medium">QR Okut</span>
        </button>
        <button onClick={() => navigate('REPORT_FAILURE')} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-red-500/20 active:scale-95 transition-all">
          <AlertTriangle className="text-red-500" size={24} />
          <span className="text-sm font-medium text-red-500">Acil Bildirim</span>
        </button>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 text-white">İş Emri Kuyruğu</h2>
        <div className="space-y-3">
          {myOrders.map((wo: WorkOrder) => (
            <WorkOrderCard key={wo.id} wo={wo} onClick={() => navigate('WO_DETAIL', wo)} />
          ))}
          {myOrders.length === 0 && (
            <div className="text-center py-10 bg-[#141414] rounded-xl border border-neutral-800">
              <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
              <p className="text-neutral-400">Tüm işler tamamlandı. Harika iş!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="OEE" value="78%" icon={BarChart3} color="emerald" />
        <StatCard title="Açık İşler" value="12" icon={WrenchIcon} color="amber" />
        <StatCard title="Kritik Duruş" value="1" icon={AlertTriangle} color="red" />
        <StatCard title="MTTR" value="4.2s" icon={Clock} color="blue" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141414] p-5 rounded-xl border border-neutral-800">
          <h3 className="font-semibold text-white mb-4">Arıza Dağılımı (Pareto)</h3>
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-semibold inline-block text-neutral-300">Sensör / Elektrik</span></div>
                <div className="text-right"><span className="text-xs font-semibold inline-block text-amber-500">45%</span></div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-neutral-800">
                <div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-semibold inline-block text-neutral-300">Mekanik / Rulman</span></div>
                <div className="text-right"><span className="text-xs font-semibold inline-block text-amber-500">30%</span></div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-neutral-800">
                <div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#141414] p-5 rounded-xl border border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Kritik Ekipman Sağlığı</h3>
            <Activity size={16} className="text-neutral-500"/>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg border border-neutral-800">
               <div>
                 <p className="font-medium text-sm text-neutral-200">CNC-04 Torna</p>
                 <p className="text-xs text-red-500 mt-1 flex items-center"><Thermometer size={12} className="mr-1"/> Sıcaklık Alarmı</p>
               </div>
               <span className="text-xl font-bold text-red-500">45</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg border border-neutral-800">
               <div>
                 <p className="font-medium text-sm text-neutral-200">MTR-01 Ana Konveyör</p>
                 <p className="text-xs text-emerald-500 mt-1">Normal Operasyon</p>
               </div>
               <span className="text-xl font-bold text-emerald-500">88</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkOrderCard({ wo, onClick }: { wo: WorkOrder, onClick: () => void }) {
  const { assets } = React.useContext(AppContext);
  const asset = assets.find((a: Asset) => a.id === wo.assetId);
  const priorityColors: Record<string, string> = {
    CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/20',
    HIGH: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    MEDIUM: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    LOW: 'text-neutral-400 bg-neutral-800 border-neutral-700'
  };
  const statusMap: Record<string, string> = { NEW: 'YENİ', IN_PROGRESS: 'DEVAM EDİYOR', COMPLETED: 'TAMAMLANDI', CLOSED: 'KAPALI' };

  return (
    <div onClick={onClick} className="bg-[#141414] p-4 rounded-xl border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer group flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-mono text-neutral-500">{wo.id}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${priorityColors[wo.priority]}`}>{wo.priority}</span>
          {wo.status === 'IN_PROGRESS' && (
             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider text-amber-500 bg-amber-500/10 border-amber-500/20 flex items-center">
               <Activity size={10} className="mr-1 animate-pulse" /> {statusMap[wo.status]}
             </span>
          )}
        </div>
        <h4 className="font-semibold text-neutral-100 group-hover:text-amber-500 transition-colors">{wo.title}</h4>
        <p className="text-sm text-neutral-400 mt-1 flex items-center">
          <Settings size={14} className="mr-1" /> {asset?.name} ({asset?.location})
        </p>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-neutral-800/50 pt-3 sm:pt-0 sm:pl-4">
         <div className="text-xs text-neutral-500 flex items-center mb-1">
           <Clock size={12} className="mr-1" /> {new Date(wo.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
         </div>
         <ArrowRight size={18} className="text-neutral-600 group-hover:text-amber-500 hidden sm:block" />
      </div>
    </div>
  );
}

function ReportFailure() {
  const { assets, setWorkOrders, navigate } = React.useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ assetId: '', title: '', priority: 'MEDIUM' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newWO: WorkOrder = {
        id: `WO-26-00${Math.floor(Math.random() * 100) + 3}`,
        title: form.title || 'Otomatik Arıza Kaydı',
        assetId: form.assetId,
        priority: form.priority as any,
        status: 'NEW', createdAt: new Date().toISOString(), timerSeconds: 0, isTimerRunning: false
      };
      setWorkOrders((prev: WorkOrder[]) => [newWO, ...prev]);
      setLoading(false);
      navigate('DASHBOARD');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('DASHBOARD')} className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800"><X size={20} /></button>
        <h1 className="text-2xl font-bold text-white">Yeni Arıza Bildirimi</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 md:p-6 space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><QrCode size={20} /></div>
            <div>
              <p className="font-medium text-amber-500">QR Kod ile Hızlı Seçim</p>
              <p className="text-xs text-amber-500/70">Makine üzerindeki kodu okutun</p>
            </div>
          </div>
          <button type="button" className="px-3 py-1.5 bg-amber-500 text-black text-sm font-semibold rounded-lg">Okut</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Makine / Ekipman</label>
            <select required className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-amber-500" value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})}>
              <option value="" disabled>Ekipman Seçin...</option>
              {assets.map((a: Asset) => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Öncelik</label>
            <div className="grid grid-cols-3 gap-3">
              {['LOW', 'MEDIUM', 'CRITICAL'].map((level) => (
                <button key={level} type="button" onClick={() => setForm({...form, priority: level})} className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${form.priority === level ? level === 'CRITICAL' ? 'bg-red-500 text-white border-red-500' : 'bg-amber-500 text-black border-amber-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}>
                  {level === 'CRITICAL' ? 'ACİL' : level === 'MEDIUM' ? 'NORMAL' : 'DÜŞÜK'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Arıza Özeti</label>
            <input required type="text" placeholder="Örn: Konveyör motoru aşırı ısınıyor" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-amber-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg py-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-70">
          {loading ? <Activity className="animate-spin" /> : 'GÖNDER VE İŞ EMRİ OLUŞTUR'}
        </button>
      </form>
    </div>
  );
}

function WorkOrderDetail() {
  // EKLENEN: workOrders'ı da context'ten çekiyoruz
  const { selectedWO, workOrders, setWorkOrders, assets, navigate } = React.useContext(AppContext);
  
  // ÇÖZÜM: Sabit veri yerine, global listedeki en güncel iş emrini anlık buluyoruz
  const wo = workOrders.find((w: WorkOrder) => w.id === selectedWO?.id) || null;

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (wo && wo.isTimerRunning) {
      interval = setInterval(() => setWorkOrders((prev: WorkOrder[]) => prev.map(w => w.id === wo.id ? { ...w, timerSeconds: w.timerSeconds + 1 } : w)), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [wo?.isTimerRunning, wo?.id, setWorkOrders]);

  if (!wo) return null;

  const asset = assets.find((a: Asset) => a.id === wo.assetId);
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const toggleTimer = () => setWorkOrders((prev: WorkOrder[]) => prev.map(w => w.id === wo.id ? { ...w, isTimerRunning: !w.isTimerRunning, status: !w.isTimerRunning ? 'IN_PROGRESS' : w.status } : w));
  const completeWork = () => { if(window.confirm("İş emrini tamamlamak istediğinize emin misiniz?")) { setWorkOrders((prev: WorkOrder[]) => prev.map(w => w.id === wo.id ? { ...w, isTimerRunning: false, status: 'COMPLETED' } : w)); navigate('DASHBOARD'); }};
  const loadAiDiagnostics = () => { setIsAiLoading(true); setTimeout(() => { setAiSuggestions(["Geçmiş kayıtlara göre bu motorda rulman ısınması sık görülüyor.", "Soğutma fanı çalışıyor mu kontrol edin.", "Faz akımlarını pens ampermetre ile ölçün."]); setIsAiLoading(false); }, 1500); };

  return (
    <div className="h-full flex flex-col pb-24 md:pb-0 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('WORK_ORDERS')} className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800"><ArrowRight size={20} className="rotate-180" /></button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">{wo.id} {wo.status === 'COMPLETED' && <CheckCircle className="ml-2 text-emerald-500" size={20}/>}</h1>
          <p className="text-sm text-neutral-400">{wo.title}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Ekipman Bilgisi</h3>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-neutral-900 rounded-xl"><Cpu className="text-amber-500" size={24} /></div>
              <div>
                <p className="font-bold text-lg text-white">{asset?.code}</p>
                <p className="text-neutral-400">{asset?.name}</p>
                <button onClick={() => navigate('ASSET_DETAIL', asset)} className="mt-2 text-xs px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded hover:bg-amber-500/20">Geçmişi Gör</button>
              </div>
            </div>
          </div>
          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">AI Hata Analizi (Troubleshooting)</h3>
            {aiSuggestions.length === 0 ? (
              <button onClick={loadAiDiagnostics} className="w-full py-3 border border-dashed border-amber-500/50 rounded-xl text-amber-500 hover:bg-amber-500/10 flex items-center justify-center font-medium transition-colors">
                {isAiLoading ? <Activity className="animate-spin mr-2" /> : <Zap size={18} className="mr-2" />}
                {isAiLoading ? 'Yapay Zeka Analiz Ediyor...' : 'AI Asistanından Öneri Al'}
              </button>
            ) : (
              <div className="space-y-3 bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                <div className="flex items-center text-amber-500 mb-2 font-medium"><Zap size={16} className="mr-2" /> Olası Nedenler & Kontroller</div>
                <ul className="space-y-2">{aiSuggestions.map((s, i) => <li key={i} className="text-sm text-neutral-300 flex items-start"><span className="text-amber-500 mr-2 mt-0.5">•</span> {s}</li>)}</ul>
              </div>
            )}
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
             <div className="flex items-center text-red-500 font-bold mb-3"><ShieldAlert size={20} className="mr-2" /> Güvenlik & LOTO</div>
             <label className="flex items-center space-x-3 text-sm text-neutral-200">
               <input type="checkbox" className="w-5 h-5 rounded border-neutral-600 bg-neutral-900 accent-red-500" />
               <span>Enerji kesildi ve LOTO (Etiketle & Kilitle) prosedürü uygulandı.</span>
             </label>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6 text-center sticky top-24">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Müdahale Süresi</h3>
            <div className="text-5xl font-mono font-bold text-white tracking-tight mb-6">{formatTime(wo.timerSeconds)}</div>
            {wo.status !== 'COMPLETED' ? (
              <div className="space-y-3">
                <button onClick={toggleTimer} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${wo.isTimerRunning ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}>
                  {wo.isTimerRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />} {wo.isTimerRunning ? 'MOLA VER' : 'ÇALIŞMAYA BAŞLA'}
                </button>
                <button onClick={completeWork} disabled={wo.timerSeconds === 0} className="w-full py-3 rounded-xl font-semibold bg-neutral-900 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 transition-colors">İŞİ TAMAMLA</button>
              </div>
            ) : <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 font-bold flex items-center justify-center"><CheckCircle className="mr-2" />BAKIM TAMAMLANDI</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetList() {
  const { assets, navigate } = React.useContext(AppContext);
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-white">Ekipman Ağacı</h1>
         <div className="relative">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
           <input type="text" placeholder="Ekipman ara..." className="pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset: Asset) => (
          <div key={asset.id} onClick={() => navigate('ASSET_DETAIL', asset)} className="bg-[#141414] border border-neutral-800 p-5 rounded-xl hover:border-amber-500/50 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2 py-1 bg-neutral-900 rounded text-xs font-mono text-neutral-400">{asset.code}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${asset.status === 'RUNNING' ? 'bg-emerald-500' : asset.status === 'FAULT' ? 'bg-red-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{asset.name}</h3>
            <p className="text-sm text-neutral-400 mb-4">{asset.location}</p>
            <div className="flex justify-between items-center border-t border-neutral-800/50 pt-3">
              <span className="text-xs text-neutral-500 flex items-center"><Activity size={14} className="mr-1"/> Sağlık: {asset.healthScore}%</span>
              <button className="text-amber-500 text-sm font-medium">Detay</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkOrderList() {
  const { workOrders, navigate } = React.useContext(AppContext);
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-white">Tüm İş Emirleri</h1>
         <button className="md:hidden p-2 bg-amber-500 text-black rounded-lg"><Plus size={20}/></button>
      </div>
      <div className="space-y-3">
        {workOrders.map((wo: WorkOrder) => <WorkOrderCard key={wo.id} wo={wo} onClick={() => navigate('WO_DETAIL', wo)} />)}
      </div>
    </div>
  );
}
