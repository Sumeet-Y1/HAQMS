'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, AlertCircle, ClipboardList } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function PatientHistoryRecords() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('haqms_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch patient records');

        const data = await res.json();
        setPatient(data);
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 font-semibold">Loading records...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-rose-500">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                {patient?.name}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {patient?.gender} - Age {patient?.age} - {patient?.phoneNumber}
              </p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Medical History</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {patient?.medicalHistory ?? 'No medical history recorded'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <ClipboardList className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
              Clinical Records & Appointments
            </h2>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No appointment records found for this patient.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {new Date(appt.appointmentDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Reason: {appt.reason || 'Not specified'}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      appt.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                      appt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-500' :
                      appt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-500' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
