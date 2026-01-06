
import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, ClipboardList, CheckCircle, XCircle, 
  Plus, Search, UserCheck, Briefcase, MapPin, AlertCircle, PlayCircle, StopCircle
} from 'lucide-react';
import { Staff as StaffType, Attendance, WorkLog } from '../types';

interface StaffProps {
  staffList: StaffType[];
  attendance: Attendance[];
  workLogs: WorkLog[];
  onAddStaff: (staff: StaffType) => void;
  onUpdateAttendance: (attendance: Attendance) => void;
  onAddWorkLog: (log: WorkLog) => void;
  onUpdateWorkLog: (log: WorkLog) => void;
}

const Staff: React.FC<StaffProps> = ({ 
  staffList, 
  attendance, 
  workLogs, 
  onAddStaff, 
  onUpdateAttendance,
  onAddWorkLog,
  onUpdateWorkLog
}) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ATTENDANCE' | 'WORK_LOGS'>('DIRECTORY');
  // Simulated Logged In User (Default to first Admin)
  const [currentUser, setCurrentUser] = useState<StaffType>(staffList[0]);
  
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState(false);
  
  // New Staff Form
  const [newStaff, setNewStaff] = useState<Partial<StaffType>>({
    name: '', role: 'STAFF', department: '', email: '', phone: '', salary: 0, salaryType: 'MONTHLY', joiningDate: '', status: 'ACTIVE'
  });

  // New Work Log Form
  const [newLog, setNewLog] = useState<Partial<WorkLog>>({
    title: '', description: '', project: '', startTime: '09:00', endTime: '10:00'
  });

  // --- Helpers ---
  const today = new Date().toISOString().split('T')[0];
  const myAttendanceToday = attendance.find(a => a.staffId === currentUser.id && a.date === today);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    onUpdateAttendance({
      id: `ATT-${Date.now()}`,
      staffId: currentUser.id,
      date: today,
      inTime: timeString,
      status: 'PRESENT'
    });
  };

  const handleCheckOut = () => {
    if (!myAttendanceToday) return;
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    // Calculate hours (simplified)
    const [inH, inM] = myAttendanceToday.inTime.split(':').map(Number);
    const [outH, outM] = timeString.split(':').map(Number);
    const hours = (outH + outM/60) - (inH + inM/60);

    onUpdateAttendance({
      ...myAttendanceToday,
      outTime: timeString,
      totalHours: Number(hours.toFixed(2))
    });
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStaff({
      ...newStaff as StaffType,
      id: `EMP-${Date.now()}`,
      avatar: `https://ui-avatars.com/api/?name=${newStaff.name}&background=random&color=fff`
    });
    setIsStaffModalOpen(false);
  };

  const handleWorkLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWorkLog({
      ...newLog as WorkLog,
      id: `LOG-${Date.now()}`,
      staffId: currentUser.id,
      date: today,
      status: 'PENDING'
    });
    setIsWorkLogModalOpen(false);
  };

  const handleApproveLog = (log: WorkLog) => {
    onUpdateWorkLog({ ...log, status: 'APPROVED' });
  };

  const handleRejectLog = (log: WorkLog) => {
    onUpdateWorkLog({ ...log, status: 'REJECTED' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Staff Management</h2>
          <p className="text-slate-500">Manage employees, track attendance and work productivity.</p>
        </div>
        
        {/* Role Switcher for Demo */}
        <div className="bg-slate-100 p-2 rounded-xl flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase px-2">View As:</span>
            <select 
                className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={currentUser.id}
                onChange={e => setCurrentUser(staffList.find(s => s.id === e.target.value) || staffList[0])}
            >
                {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
            </select>
        </div>
      </div>

      <div className="bg-white p-1 rounded-xl border border-slate-200 flex w-fit">
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'DIRECTORY' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Users size={18} />
          <span>Staff Directory</span>
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'ATTENDANCE' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Clock size={18} />
          <span>Attendance</span>
        </button>
        <button
          onClick={() => setActiveTab('WORK_LOGS')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'WORK_LOGS' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ClipboardList size={18} />
          <span>Work Logs</span>
        </button>
      </div>

      {/* --- DIRECTORY TAB --- */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          <div className="flex justify-end">
             {currentUser.role === 'ADMIN' && (
                <button 
                onClick={() => setIsStaffModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md"
                >
                <Plus size={18} />
                <span>Add Employee</span>
                </button>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staffList.map(staff => (
                <div key={staff.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <img src={staff.avatar} alt={staff.name} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${staff.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {staff.status}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{staff.name}</h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">{staff.role} • {staff.department}</p>
                    
                    <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                        <div className="flex items-center space-x-2">
                             <Briefcase size={14} className="text-slate-400" />
                             <span>Joined {staff.joiningDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                             <UserCheck size={14} className="text-slate-400" />
                             <span>{staff.salaryType} Salary</span>
                        </div>
                    </div>
                    {currentUser.role === 'ADMIN' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-900">Rs. {staff.salary.toLocaleString()}</span>
                            <button className="text-blue-600 font-semibold hover:underline">View Profile</button>
                        </div>
                    )}
                </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ATTENDANCE TAB --- */}
      {activeTab === 'ATTENDANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: My Attendance Action */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="font-bold text-lg mb-1">My Daily Attendance</h3>
                <p className="text-slate-500 text-sm mb-6">{new Date().toDateString()}</p>
                
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                     {!myAttendanceToday ? (
                         <button 
                            onClick={handleCheckIn}
                            className="w-48 h-48 rounded-full bg-emerald-50 border-4 border-emerald-100 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-100 hover:scale-105 transition-all cursor-pointer group"
                         >
                             <PlayCircle size={48} className="mb-2 group-hover:scale-110 transition-transform"/>
                             <span className="font-bold text-lg">Check In</span>
                             <span className="text-xs font-medium opacity-70">Start your day</span>
                         </button>
                     ) : !myAttendanceToday.outTime ? (
                        <button 
                            onClick={handleCheckOut}
                            className="w-48 h-48 rounded-full bg-rose-50 border-4 border-rose-100 flex flex-col items-center justify-center text-rose-600 hover:bg-rose-100 hover:scale-105 transition-all cursor-pointer group"
                        >
                            <StopCircle size={48} className="mb-2 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-lg">Check Out</span>
                            <span className="text-xs font-medium opacity-70">End your day</span>
                        </button>
                     ) : (
                        <div className="w-48 h-48 rounded-full bg-slate-50 border-4 border-slate-100 flex flex-col items-center justify-center text-slate-500">
                             <CheckCircle size={48} className="mb-2 text-slate-400"/>
                             <span className="font-bold text-lg">Completed</span>
                             <span className="text-xs font-medium opacity-70">{myAttendanceToday.totalHours} hrs worked</span>
                        </div>
                     )}
                     
                     {myAttendanceToday && (
                         <div className="flex space-x-8 text-sm text-slate-600">
                             <div className="text-center">
                                 <p className="text-xs uppercase font-bold text-slate-400">In Time</p>
                                 <p className="font-mono font-bold text-lg">{myAttendanceToday.inTime}</p>
                             </div>
                             <div className="text-center">
                                 <p className="text-xs uppercase font-bold text-slate-400">Out Time</p>
                                 <p className="font-mono font-bold text-lg">{myAttendanceToday.outTime || '--:--'}</p>
                             </div>
                         </div>
                     )}
                </div>
            </div>

            {/* Right Col: Log */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Attendance Log</h3>
                    {currentUser.role === 'ADMIN' && <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Admin View</span>}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-slate-100 text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Staff</th>
                                <th className="px-6 py-3">In Time</th>
                                <th className="px-6 py-3">Out Time</th>
                                <th className="px-6 py-3">Hours</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attendance
                             .filter(a => currentUser.role === 'ADMIN' || a.staffId === currentUser.id)
                             .map(att => {
                                const staff = staffList.find(s => s.id === att.staffId);
                                return (
                                    <tr key={att.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-slate-600">{att.date}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900">{staff?.name}</td>
                                        <td className="px-6 py-3 font-mono text-slate-600">{att.inTime}</td>
                                        <td className="px-6 py-3 font-mono text-slate-600">{att.outTime || '-'}</td>
                                        <td className="px-6 py-3 font-bold text-slate-700">{att.totalHours ? `${att.totalHours} hrs` : '-'}</td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                                                {att.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* --- WORK LOGS TAB --- */}
      {activeTab === 'WORK_LOGS' && (
         <div className="space-y-6">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                 <div>
                    <h3 className="font-bold text-slate-900">Daily Work Report</h3>
                    <p className="text-xs text-slate-500">Track tasks and productivity.</p>
                 </div>
                 <button 
                    onClick={() => setIsWorkLogModalOpen(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800"
                 >
                    + Add New Task
                 </button>
             </div>

             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Staff</th>
                                <th className="px-6 py-3">Project / Task</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {workLogs
                             .filter(log => currentUser.role === 'ADMIN' || log.staffId === currentUser.id)
                             .map(log => {
                                const staff = staffList.find(s => s.id === log.staffId);
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{log.date}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{staff?.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{log.title}</div>
                                            <div className="text-xs text-blue-600 font-medium">{log.project}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.description}>{log.description}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {log.startTime} - {log.endTime}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                                log.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                log.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                'bg-amber-50 text-amber-600 border-amber-200'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(currentUser.role === 'ADMIN' && log.status === 'PENDING') && (
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => handleApproveLog(log)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Approve">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button onClick={() => handleRejectLog(log)} className="p-1 text-rose-600 hover:bg-rose-50 rounded" title="Reject">
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {workLogs.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No work logs found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
         </div>
      )}

      {/* --- ADD STAFF MODAL --- */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4">Add New Employee</h3>
                <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input required className="w-full p-2 border rounded-lg" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                            <select className="w-full p-2 border rounded-lg" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value as any})}>
                                <option value="STAFF">Staff</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                         <input required className="w-full p-2 border rounded-lg" value={newStaff.department} onChange={e => setNewStaff({...newStaff, department: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salary Type</label>
                            <select className="w-full p-2 border rounded-lg" value={newStaff.salaryType} onChange={e => setNewStaff({...newStaff, salaryType: e.target.value as any})}>
                                <option value="MONTHLY">Monthly</option>
                                <option value="HOURLY">Hourly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salary Amount</label>
                            <input type="number" required className="w-full p-2 border rounded-lg" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input type="email" required className="w-full p-2 border rounded-lg" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                            <input required className="w-full p-2 border rounded-lg" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Joining Date</label>
                         <input type="date" required className="w-full p-2 border rounded-lg" value={newStaff.joiningDate} onChange={e => setNewStaff({...newStaff, joiningDate: e.target.value})} />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold">Add Staff</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- ADD WORK LOG MODAL --- */}
      {isWorkLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4">Add Work Log</h3>
                <form onSubmit={handleWorkLogSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                        <input required className="w-full p-2 border rounded-lg" placeholder="e.g. Frontend Development" value={newLog.title} onChange={e => setNewLog({...newLog, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project / Client</label>
                        <input required className="w-full p-2 border rounded-lg" placeholder="e.g. Website Redesign" value={newLog.project} onChange={e => setNewLog({...newLog, project: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                            <input type="time" required className="w-full p-2 border rounded-lg" value={newLog.startTime} onChange={e => setNewLog({...newLog, startTime: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                            <input type="time" required className="w-full p-2 border rounded-lg" value={newLog.endTime} onChange={e => setNewLog({...newLog, endTime: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                        <textarea required rows={3} className="w-full p-2 border rounded-lg" placeholder="Details about the work done..." value={newLog.description} onChange={e => setNewLog({...newLog, description: e.target.value})} />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setIsWorkLogModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold">Submit Log</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Staff;
