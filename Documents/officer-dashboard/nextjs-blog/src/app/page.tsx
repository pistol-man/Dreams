// src/app/page.tsx
'use client';

import dynamic from "next/dynamic";
const MyMap = dynamic(() => import("../components/maps"), { ssr: false });
import { FaMapMarkedAlt, FaTable, FaChartBar, FaUserShield } from "react-icons/fa";
import BottomNavBar from '../components/BottomNavBar';
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// Dummy data for charts
const alertsOverTime = [
  { day: 'Mon', alerts: 12 },
  { day: 'Tue', alerts: 18 },
  { day: 'Wed', alerts: 10 },
  { day: 'Thu', alerts: 22 },
  { day: 'Fri', alerts: 16 },
  { day: 'Sat', alerts: 25 },
  { day: 'Sun', alerts: 20 },
];

const riskPie = [
  { name: 'High', value: 8, color: '#FF5252' },
  { name: 'Medium', value: 14, color: '#FF9800' },
  { name: 'Low', value: 28, color: '#a3b899' },
];

const improvementBar = [
  { metric: 'Response', value: 70 },
  { metric: 'Patrols', value: 40 },
  { metric: 'Awareness', value: 55 },
];

// Assign random impIndex to each row (1-7)
const tableData = [
  { id: 1, name: "Aarti Sharma", location: "Andheri, Mumbai", lat: 19.1197, lng: 72.8468, alertTime: "10:32 AM", dispatchTime: "10:35 AM", impIndex: 2, photo: "/1.jpeg" },
  { id: 2, name: "Priya Singh", location: "Bandra, Mumbai", lat: 19.0606, lng: 72.8365, alertTime: "11:10 AM", dispatchTime: "", impIndex: 1, photo: "/2.jpeg" },
  { id: 3, name: "Neha Patel", location: "Powai, Mumbai", lat: 19.1177, lng: 72.9046, alertTime: "11:45 AM", dispatchTime: "", impIndex: 5, photo: "/3.jpeg" },
  // ...add more rows as needed
];

// Importance color map
const impColors = {
  1: { bg: "#FF5252", text: "white" },
  2: { bg: "#FF9800", text: "white" },
  3: { bg: "#FFC107", text: "#22223B" },
  4: { bg: "#FFEB3B", text: "#22223B" },
  5: { bg: "#CDDC39", text: "#22223B" },
  6: { bg: "#8BC34A", text: "white" },
  7: { bg: "#4CAF50", text: "white" },
};

export default function OfficerDashboard() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col pb-28">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm rounded-b-2xl">
        <h1 className="text-2xl font-bold text-[#22223B] tracking-wide">181 Officer Dashboard</h1>
        <button className="bg-[#A8E6CF] hover:bg-[#FFD3B6] text-[#22223B] px-4 py-2 rounded-xl font-semibold shadow transition">Logout</button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Map Section */}
        <section className="bg-white rounded-2xl shadow-md border border-[#E3EAFD] p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-[#22223B] mb-2 flex items-center gap-2">
            <FaMapMarkedAlt className="text-[#64B5F6]" /> Real-Time Safety Heatmap
          </h2>
          <p className="text-xs text-[#5C6BC0] mb-4">Live distress call density & hotspots</p>
          <div className="flex-1 rounded-xl overflow-hidden border border-[#E3EAFD] bg-[#F4F7FA]">
            <MyMap alerts={tableData} />
          </div>
        </section>

        {/* Table Section */}
        <section className="bg-white rounded-2xl shadow-md border border-[#E3EAFD] p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-[#22223B] mb-2 flex items-center gap-2">
            <FaTable className="text-[#FFD3B6]" /> Active Alerts
          </h2>
          <p className="text-xs text-[#5C6BC0] mb-4">Respond to real-time distress pings</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-[#F4F7FA] text-[#22223B]">
                  <th className="px-4 py-3 rounded-tl-2xl">User</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Alert Time</th>
                  <th className="px-4 py-3">Dispatch Time</th>
                  <th className="px-4 py-3">Imp Index</th>
                  <th className="px-4 py-3 rounded-tr-2xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...tableData].sort((a, b) => a.impIndex - b.impIndex).map((row) => {
                  const imp = impColors[row.impIndex as keyof typeof impColors];
                  return (
                    <tr key={row.id} className="even:bg-[#fceee9]">
                      <td className="px-4 py-3 font-semibold text-black">{row.name}</td>
                      <td className="px-4 py-3 text-black">{row.location}</td>
                      <td className="px-4 py-3 text-black">{row.alertTime}</td>
                      <td className="px-4 py-3 text-black">
                        {row.dispatchTime || <span className="text-black">Pending</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full font-bold shadow"
                          style={{
                            background: imp.bg,
                            color: imp.text,
                            minWidth: 32,
                            display: "inline-block",
                            textAlign: "center",
                            border: "2px solid #fff",
                          }}
                        >
                          {row.impIndex}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className={`px-4 py-1 rounded-full font-bold shadow transition ${
                            row.dispatchTime
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-[#a3b899] hover:bg-[#dde6d5] text-white"
                          }`}
                          disabled={!!row.dispatchTime}
                          onClick={() => alert(`Dispatching to ${row.name}`)}
                        >
                          Dispatch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Charts Section */}
        <section className="bg-white rounded-2xl shadow-md border border-[#E3EAFD] p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-[#22223B] mb-2 flex items-center gap-2">
            <FaChartBar className="text-[#80deea]" /> Officer Activity & Insights
          </h2>
          <p className="text-xs text-[#5C6BC0] mb-4">Monitor performance & response metrics</p>

          {/* Responsive container for charts */}
          <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#E3EAFD] bg-[#F4F7FA]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={alertsOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="alerts" stroke="#64B5F6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart for risk distribution */}
          <div className="mt-4 flex-1 w-full rounded-xl overflow-hidden border border-[#E3EAFD] bg-[#F4F7FA]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Legend verticalAlign="top" />
                <Tooltip />
                <Pie
                  data={riskPie}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                >
                  {riskPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart for improvement areas */}
          <div className="mt-4 flex-1 w-full rounded-xl overflow-hidden border border-[#E3EAFD] bg-[#F4F7FA]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={improvementBar} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Analytics Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Officer Activity & Insights */}
          <div className="bg-white rounded-2xl shadow-md border border-[#dde6d5] p-6 flex flex-col min-h-[320px]">
            <h2 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
              <FaChartBar className="text-[#80deea]" /> Officer Activity & Insights
            </h2>
            <p className="text-sm text-[#5C6BC0] mb-4">Monitor performance & response metrics</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={alertsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" tick={{ fontSize: 14 }} />
                <YAxis tick={{ fontSize: 14 }} />
                <Tooltip />
                <Line type="monotone" dataKey="alerts" stroke="#64B5F6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Alerts Over Time */}
          <div className="bg-white rounded-2xl shadow-md border border-[#dde6d5] p-6 flex flex-col min-h-[320px]">
            <h3 className="text-xl font-bold text-black mb-2">Alerts Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={alertsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" tick={{ fontSize: 14 }} />
                <YAxis tick={{ fontSize: 14 }} />
                <Tooltip />
                <Line type="monotone" dataKey="alerts" stroke="#f8d3c5" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Risk Distribution */}
          <div className="bg-white rounded-2xl shadow-md border border-[#dde6d5] p-6 flex flex-col min-h-[320px]">
            <h3 className="text-xl font-bold text-black mb-2">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name }) => name}
                >
                  {riskPie.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Improvement Metrics */}
          <div className="bg-white rounded-2xl shadow-md border border-[#dde6d5] p-6 flex flex-col min-h-[320px]">
            <h3 className="text-xl font-bold text-black mb-2">Improvement Metrics</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={improvementBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="metric" tick={{ fontSize: 14 }} />
                <YAxis tick={{ fontSize: 14 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#a3b899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      {/* Floating Bottom Nav */}
      <BottomNavBar />
    </div>
  );
}
