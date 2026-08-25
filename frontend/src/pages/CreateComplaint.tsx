import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LocationPicker from '../components/LocationPicker';

const CreateComplaint = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationSource, setLocationSource] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    
    // Free memory when ever this component is unmounted or file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleLocationSelect = (lat: number, lng: number, acc: number | null, source: string, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationAccuracy(acc);
    setLocationSource(source);
    setAddress(addr);
  };

  const [step, setStep] = useState(1);

  const checkDuplicates = async () => {
    if (!latitude || !longitude || !category || !title) return false;
    try {
      const res = await api.post('/complaints/check-duplicate', {
        title, category, latitude, longitude
      });
      if (res.data.duplicates && res.data.duplicates.length > 0) {
        setDuplicates(res.data.duplicates);
        setShowDuplicates(true);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleNextStep = async () => {
    setError('');
    if (step === 1) {
      if (!category) { setError('Please select a category.'); return; }
      if (!latitude || !longitude) { setError('Please select a location on the map.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!title || title.length < 5) { setError('Please enter a valid title (min 5 chars).'); return; }
      if (!description || description.length < 10) { setError('Please enter a valid description (min 10 chars).'); return; }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent, forceSubmit = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (file && file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      setLoading(false);
      return;
    }

    if (!forceSubmit) {
       const hasDuplicates = await checkDuplicates();
       if (hasDuplicates) {
         setLoading(false);
         return; // Wait for user confirmation
       }
    }

    try {
      const res = await api.post('/complaints/', {
        title,
        description,
        category,
        latitude,
        longitude,
        location_accuracy: locationAccuracy,
        location_source: locationSource,
        human_readable_address: address,
        phone_number: phoneNumber,
      });
      
      const complaintId = res.data.id;
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/complaints/${complaintId}/evidence`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setSuccessData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animation-fade-in">
      <div className="glass-panel rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Report a New Issue</h1>
        <div className="flex gap-2 mb-8 relative z-10">
           <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
           <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
           <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur border-l-4 border-red-500 p-4 rounded-md relative z-10">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {successData ? (
          <div className="text-center relative z-10 py-10 animation-fade-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Complaint Registered Successfully</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">Your issue has been submitted. Government staff will review it shortly. Please save your tracking ID.</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 max-w-md mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
              <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">Tracking ID</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{successData.tracking_id}</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(successData.tracking_id)}
                  className="p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors tooltip"
                  title="Copy Tracking ID"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(`/complaints/${successData.tracking_id}`)}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 shadow-sm hover:shadow-md transition-all"
              >
                View Complaint Details
              </button>
              <button
                onClick={() => navigate('/my-complaints')}
                className="bg-white text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 shadow-sm border border-slate-200 transition-all"
              >
                Go to My Complaints
              </button>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={(e) => { e.preventDefault(); }} 
            onKeyDown={(e) => {
              // Prevent implicit submission on Enter key, except for textareas
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}
            className="space-y-6 relative z-10"
          >
          
          {step === 1 && (
            <div className="space-y-6 animation-fade-in">
              <h2 className="text-lg font-semibold text-slate-800">Step 1: Where and What?</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  required
                  className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Roads and potholes">Roads and potholes</option>
                  <option value="Streetlights">Streetlights</option>
                  <option value="Waste and sanitation">Waste and sanitation</option>
                  <option value="Water">Water</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Public infrastructure">Public infrastructure</option>
                  <option value="Safety hazard">Safety hazard</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animation-fade-in">
              <h2 className="text-lg font-semibold text-slate-800">Step 2: Issue Details</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={200}
                  className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="E.g., Broken streetlight on 5th Avenue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Please provide details about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animation-fade-in">
              <h2 className="text-lg font-semibold text-slate-800">Step 3: Evidence & Review</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Evidence (Optional)</label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  onChange={(e) => setFile(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Upload a photo related to the incident (Max 5MB).
                </p>
                {filePreview && (
                  <div className="mt-4 relative inline-block">
                    <img src={filePreview} alt="Preview" className="h-32 rounded-lg border border-slate-200 shadow-sm object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFile(null)} 
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm hover:bg-rose-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="For updates on your complaint"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                />
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 mt-4">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-1">{description}</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">Category: {category}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Location: {address || `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`}</p>
              </div>
            </div>
          )}

          {showDuplicates && step === 3 && (
            <div className="bg-yellow-50/90 backdrop-blur border-l-4 border-yellow-500 p-4 rounded-xl shadow-sm animation-fade-in">
              <h3 className="text-sm font-bold text-yellow-800">Similar Reports Found Nearby</h3>
              <p className="text-xs text-yellow-700 mb-2">We found {duplicates.length} similar reports in this area. Is your issue already reported?</p>
              <ul className="space-y-2 mb-3">
                {duplicates.map(d => (
                  <li key={d.id} className="text-sm text-yellow-800 bg-yellow-100/50 px-3 py-2 rounded-lg border border-yellow-200">
                    <strong>{d.title}</strong> - {d.status}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                 <button
                   type="button"
                   onClick={() => navigate('/citizen')}
                   className="text-xs bg-white text-yellow-800 px-4 py-2 rounded-lg border border-yellow-300 hover:bg-yellow-50 transition-colors font-medium shadow-sm"
                 >
                   Yes, this is my issue. Cancel report.
                 </button>
                 <button
                   type="button"
                   onClick={(e) => handleSubmit(e, true)}
                   className="text-xs bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-sm"
                 >
                   No, my issue is different. Continue submitting.
                 </button>
              </div>
            </div>
          )}

          {!showDuplicates && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/citizen')}
                  className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-primary-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-primary-700 hover:shadow-lg transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e)}
                  disabled={loading}
                  className="bg-primary-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-primary-700 hover:shadow-lg transition-all disabled:opacity-70 disabled:hover:shadow-none flex items-center"
                >
                  {loading ? 'Checking...' : 'Submit Report'}
                </button>
              )}
            </div>
          )}
        </form>
        )}
      </div>
    </div>
  );
};

export default CreateComplaint;
