import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getKPIColor } from './utils/kpi';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  Plus, 
  LogOut, 
  User, 
  Lock,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newTrip, setNewTrip] = useState({
    vehicle_no: '',
    driver_name: '',
    origin: 'Pabrik FGV Sahabat',
    destination: 'Pelabuhan Lahad Datu',
    departure_time: '',
    estimated_arrival: '',
    cargo_type: 'Minyak Sawit Mentah (CPO)',
    weight_tonnes: '',
    status: 'Dalam Perjalanan'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;
      setTrips(tripsData || []);

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleAddTrip(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('trips').insert([newTrip]);
      if (error) throw error;
      alert('Perjalanan berjaya ditambah!');
      setNewTrip({
        vehicle_no: '',
        driver_name: '',
        origin: 'Pabrik FGV Sahabat',
        destination: 'Pelabuhan Lahad Datu',
        departure_time: '',
        estimated_arrival: '',
        cargo_type: 'Minyak Sawit Mentah (CPO)',
        weight_tonnes: '',
        status: 'Dalam Perjalanan'
      });
      fetchData();
      setActiveTab('trips');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculation for KPIs
  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'Selesai').length;
  const activeTrips = trips.filter(t => t.status === 'Dalam Perjalanan').length;
  const delayedTrips = trips.filter(t => t.status === 'Lewat').length;
  const totalWeight = trips.reduce((sum, t) => sum + (parseFloat(t.weight_tonnes) || 0), 0);
  const otpRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 100;

  if (loading && !session) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-emerald-500/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Truck className="w-8 h-8 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">FGV Transport Sahabat</h1>
            <p className="text-slate-500 text-sm mt-1">Sistem Pengurusan & Pemantauan Logistik</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">E-mel Rasmi</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="pengguna@fgv.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kata Laluan</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-emerald-700/30 transition duration-200"
            >
              Log Masuk Sistem
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredTrips = trips.filter(t => 
    t.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="w-7 h-7 text-amber-400" />
            <div>
              <h1 className="font-bold text-lg leading-tight">FGV Transport Sahabat</h1>
              <p className="text-xs text-emerald-200">Hab Logistik & Operasi Wilayah</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs bg-emerald-800 px-3 py-1 rounded-full border border-emerald-700 hidden sm:inline-block">
              {session.user.email}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-emerald-800 rounded-lg transition text-emerald-200 hover:text-white"
              title="Log Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 px-4 font-medium text-sm flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-emerald-700 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Paparan Utama (Dashboard)</span>
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-3 px-4 font-medium text-sm flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'trips'
                ? 'border-emerald-700 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Senarai Perjalanan ({trips.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 px-4 font-medium text-sm flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'add'
                ? 'border-emerald-700 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Perjalanan Baru</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Jumlah Perjalanan</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalTrips}</h3>
                  </div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Dalam Perjalanan</p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1">{activeTrips}</h3>
                  </div>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Muatan Diangkut (Tan)</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalWeight.toLocaleString()}</h3>
                  </div>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Prestasi Ketepatan (OTP)</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <h3 className="text-2xl font-bold text-slate-800">{otpRate}%</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full border font-semibold ${getKPIColor(otpRate)}`}>
                        {otpRate >= 90 ? 'Cemerlang' : 'Sederhana'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Overview Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">Perjalanan Terkini</h2>
                <button 
                  onClick={() => setActiveTab('trips')} 
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="p-3">No. Kenderaan</th>
                      <th className="p-3">Pemandu</th>
                      <th className="p-3">Destinasi</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trips.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-700">{t.vehicle_no}</td>
                        <td className="p-3">{t.driver_name}</td>
                        <td className="p-3">{t.destination}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            t.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'Dalam Perjalanan' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIST TRIPS */}
        {activeTab === 'trips' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari no. kenderaan, pemandu, atau destinasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="p-4">No. Kenderaan</th>
                      <th className="p-4">Pemandu</th>
                      <th className="p-4">Laluan (Asal ➔ Destinasi)</th>
                      <th className="p-4">Muatan</th>
                      <th className="p-4">Berat (Tan)</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-800">{t.vehicle_no}</td>
                        <td className="p-4">{t.driver_name}</td>
                        <td className="p-4">
                          <span className="text-slate-600">{t.origin}</span>
                          <span className="mx-2 text-slate-400">➔</span>
                          <span className="font-medium text-slate-800">{t.destination}</span>
                        </td>
                        <td className="p-4">{t.cargo_type}</td>
                        <td className="p-4 font-semibold">{t.weight_tonnes}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            t.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'Dalam Perjalanan' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADD TRIP */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Daftar Perjalanan Lori Baru</h2>
            <form onSubmit={handleAddTrip} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. Kenderaan (Lori)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SAB 1234 A"
                    value={newTrip.vehicle_no}
                    onChange={(e) => setNewTrip({ ...newTrip, vehicle_no: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pemandu</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Penuh Pemandu"
                    value={newTrip.driver_name}
                    onChange={(e) => setNewTrip({ ...newTrip, driver_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi Asal</label>
                  <input
                    type="text"
                    required
                    value={newTrip.origin}
                    onChange={(e) => setNewTrip({ ...newTrip, origin: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Destinasi</label>
                  <input
                    type="text"
                    required
                    value={newTrip.destination}
                    onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Muatan</label>
                  <input
                    type="text"
                    required
                    value={newTrip.cargo_type}
                    onChange={(e) => setNewTrip({ ...newTrip, cargo_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Berat Muatan (Tan)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Contoh: 25.5"
                    value={newTrip.weight_tonnes}
                    onChange={(e) => setNewTrip({ ...newTrip, weight_tonnes: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
              >
                Simpan Perjalanan
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
