import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, Customer, JourneyEntry } from '../lib/supabase';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Mail, 
  MoreVertical, 
  Plus, 
  Loader2,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [journeys, setJourneys] = useState<JourneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingJourney, setIsAddingJourney] = useState(false);
  const [newJourney, setNewJourney] = useState({
    visit_date: format(new Date(), 'yyyy-MM-dd'),
    summary: '',
    details: '',
    type: 'meeting' as JourneyEntry['type']
  });

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    if (!id) return;
    try {
      const [customerRes, journeyRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', id).single(),
        supabase.from('journeys').select('*').eq('customer_id', id).order('visit_date', { ascending: false })
      ]);

      if (customerRes.error) throw customerRes.error;
      setCustomer(customerRes.data);
      setJourneys(journeyRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const { error } = await supabase.from('journeys').insert([
        { ...newJourney, customer_id: id }
      ]);
      if (error) throw error;
      
      setIsAddingJourney(false);
      setNewJourney({
        visit_date: format(new Date(), 'yyyy-MM-dd'),
        summary: '',
        details: '',
        type: 'meeting'
      });
      fetchCustomerData();
    } catch (err) {
      console.error('Error adding journey:', err);
      alert('Failed to add journey entry');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 sticky top-8">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
              <span className="text-3xl font-bold text-gray-400">{customer.name.charAt(0)}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{customer.name}</h1>
            <p className="text-gray-500 mb-6">{customer.company}</p>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{customer.phone}</span>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="mt-8 pt-6 border-t border-gray-50">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Journey</h2>
            <button
              onClick={() => setIsAddingJourney(true)}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Visit
            </button>
          </div>

          {journeys.length > 0 ? (
            <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
              {journeys.map((entry) => (
                <div key={entry.id} className="relative pl-12">
                  <div className="absolute left-0 top-1 w-9 h-9 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center z-10">
                    {entry.type === 'meeting' && <MapPin className="w-4 h-4 text-blue-500" />}
                    {entry.type === 'call' && <Phone className="w-4 h-4 text-green-500" />}
                    {entry.type === 'email' && <Mail className="w-4 h-4 text-purple-500" />}
                    {entry.type === 'other' && <MessageSquare className="w-4 h-4 text-gray-400" />}
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {format(new Date(entry.visit_date), 'MMMM d, yyyy')}
                      </span>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        entry.type === 'meeting' && "bg-blue-50 text-blue-600",
                        entry.type === 'call' && "bg-green-50 text-green-600",
                        entry.type === 'email' && "bg-purple-50 text-purple-600",
                        entry.type === 'other' && "bg-gray-50 text-gray-600"
                      )}>
                        {entry.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{entry.summary}</h3>
                    {entry.details && (
                      <p className="text-gray-600 text-sm leading-relaxed">{entry.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No journey entries yet. Log your first visit above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Journey Modal */}
      {isAddingJourney && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Log Interaction</h2>
            <form onSubmit={handleAddJourney} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newJourney.visit_date}
                    onChange={e => setNewJourney({...newJourney, visit_date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
                  <select
                    value={newJourney.type}
                    onChange={e => setNewJourney({...newJourney, type: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-white"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Summary</label>
                <input
                  required
                  placeholder="Brief summary of the interaction"
                  value={newJourney.summary}
                  onChange={e => setNewJourney({...newJourney, summary: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Detailed Notes</label>
                <textarea
                  rows={4}
                  placeholder="What was discussed? Any follow-up actions?"
                  value={newJourney.details}
                  onChange={e => setNewJourney({...newJourney, details: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingJourney(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
