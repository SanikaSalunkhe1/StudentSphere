import React, { useState } from "react";
import { reportService } from "../services/reportService";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function AccreditationReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportService.getAccreditationReport({ year, branch });
      setData(res.data);
      toast.success("Report data loaded successfully!");
    } catch (error) {
      toast.error("Failed to load report data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!data) return toast.error("No data to export!");
    try {
      setExporting(true);
      toast.info("Generating PDF, please wait...");
      const input = document.getElementById("report-content");
      
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Accreditation_Report_${branch || "All"}_${year || "All"}.pdf`);
      toast.success("PDF Generated Successfully!");
    } catch (error) {
      console.error("PDF Gen Error:", error);
      toast.error(`Failed to generate PDF: ${error?.message || "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">NAAC/NBA Accreditation Reports</h1>
        <button 
          onClick={generatePDF} 
          disabled={exporting || !data}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {exporting ? "Generating..." : "Download as PDF"}
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow flex gap-4 items-end mb-6">
        <div>
          <label className="block text-sm font-bold text-slate-700">Academic Year</label>
          <input 
            type="text" 
            placeholder="e.g. 2024-2025" 
            className="border p-2 rounded w-full"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-bold text-slate-700">Branch</label>
          <select 
            className="border p-2 rounded w-full"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="Computer">Computer</option>
          </select>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition disabled:opacity-50 font-semibold"
        >
          {loading ? "Loading..." : "Fetch Data"}
        </button>
      </div>

      {data && (
        <div id="report-content" className="bg-white p-8 shadow rounded border border-gray-100" style={{ minHeight: '800px' }}>
          <div className="text-center mb-8 border-b pb-6">
            <h2 className="text-3xl font-bold uppercase tracking-wider text-slate-800">Institutional Accreditation Report</h2>
            <p className="text-gray-500 mt-2 font-medium">Filter Criteria: Year - {year || "All"}, Branch - {branch || "All"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="p-6 bg-slate-50 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-bold text-xl border-b pb-3 mb-4 text-blue-700">1. Placements Summary</h3>
              <div className="space-y-3 font-medium text-slate-700">
                <p className="flex justify-between"><span>Total Students Placed:</span> <span className="text-lg font-bold">{data.placements.stats.totalPlaced}</span></p>
                <p className="flex justify-between"><span>Highest Package:</span> <span className="text-lg font-bold text-green-600">{data.placements.stats.maxPackage || 0} LPA</span></p>
                <p className="flex justify-between"><span>Average Package:</span> <span className="text-lg font-bold text-indigo-600">{data.placements.stats.avgPackage ? data.placements.stats.avgPackage.toFixed(2) : 0} LPA</span></p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-bold text-xl border-b pb-3 mb-4 text-emerald-700">2. Internships Summary</h3>
              <div className="space-y-3 font-medium text-slate-700">
                <p className="flex justify-between"><span>Total Internships:</span> <span className="text-lg font-bold">{data.internships.totalInternships}</span></p>
                <p className="flex justify-between"><span>Paid Internships:</span> <span className="text-lg font-bold text-green-600">{data.internships.paidCount}</span></p>
                <p className="flex justify-between"><span>Unpaid Internships:</span> <span className="text-lg font-bold text-orange-600">{data.internships.unpaidCount}</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold mb-4 text-center text-lg text-slate-700">Placement by Top Companies</h3>
              <div className="flex justify-center flex-col items-center overflow-x-auto">
                {data.placements.topCompanies.length > 0 ? (
                    <BarChart width={350} height={300} data={data.placements.topCompanies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#3b82f6" name="Students Placed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400">No Placement Data available</div>
                )}
              </div>
            </div>

            <div className="border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold mb-4 text-center text-lg text-slate-700">Achievements by Category</h3>
              <div className="flex justify-center">
                {data.achievements.byCategory.length > 0 ? (
                  <PieChart width={350} height={300}>
                    <Pie
                      data={data.achievements.byCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="_id"
                      label
                    >
                      {data.achievements.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400">No Achievement Data available</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border rounded-xl p-6 shadow-sm">
             <h3 className="font-bold text-xl border-b pb-3 mb-6 text-purple-700">3. Student Demographics</h3>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-slate-200">
                <thead>
                    <tr className="bg-slate-100 text-slate-700">
                    <th className="py-3 px-6 border-b text-left font-bold uppercase text-sm tracking-wider">Category</th>
                    <th className="py-3 px-6 border-b text-left font-bold uppercase text-sm tracking-wider">Count</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {data.demographics.categories.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6 border-b font-medium">{c._id || "Unspecified"}</td>
                        <td className="py-3 px-6 border-b bg-slate-50/50 font-bold">{c.count}</td>
                    </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold border-t-2 border-slate-300 text-blue-900">
                    <td className="py-4 px-6 border-b uppercase">Total Students</td>
                    <td className="py-4 px-6 border-b text-lg">{data.demographics.total}</td>
                    </tr>
                </tbody>
                </table>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}