import React from 'react';
import { X, Shield, Info, HelpCircle, Lock, BookOpen } from 'lucide-react';

export type InfoContentType = 'ABOUT' | 'HOW_IT_WORKS' | 'FEATURES' | 'SUPPORT' | 'FAQ' | 'PRIVACY' | 'TERMS' | 'SECURITY';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: InfoContentType | null;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, contentType }) => {
  if (!isOpen || !contentType) return null;

  const contentMap = {
    ABOUT: {
      title: 'About CivicShield',
      icon: <Info className="w-6 h-6 text-primary-500" />,
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <p>
            <strong>CivicShield</strong> is a smart civic issue reporting platform designed to help citizens effectively report, track, and follow community issues.
          </p>
          <p>
            Citizens can easily drop pins on a map, upload photographic evidence, and submit detailed reports about infrastructure or safety concerns.
          </p>
          <p>
            By leveraging advanced AI priority analysis, the platform automatically categorizes issues and assigns initial priority levels, ensuring that government staff and officers can efficiently manage and resolve critical complaints.
          </p>
        </div>
      ),
    },
    HOW_IT_WORKS: {
      title: 'How It Works',
      icon: <HelpCircle className="w-6 h-6 text-primary-500" />,
      content: (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Report</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Citizens submit an issue with details and optional photographic evidence.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Analyze</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">The system evaluates the complaint and assigns a priority using AI.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Track</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Citizens monitor the complaint status and timeline progress using a unique Tracking ID.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Resolve</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Officers review, manage, and update the complaint until the issue is fixed.</p>
            </div>
          </div>
        </div>
      ),
    },
    FEATURES: {
      title: 'Platform Features',
      icon: <Shield className="w-6 h-6 text-primary-500" />,
      content: (
        <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
          <li><strong>Complaint reporting:</strong> Submit detailed civic issues.</li>
          <li><strong>Evidence/photo upload:</strong> Attach images to your reports.</li>
          <li><strong>Complaint tracking:</strong> Follow progress with a unique Tracking ID.</li>
          <li><strong>Status timeline:</strong> See every update from submission to resolution.</li>
          <li><strong>AI priority analysis:</strong> Automated severity assessment.</li>
          <li><strong>Citizen dashboard:</strong> Manage and track your personal reports.</li>
          <li><strong>Officer dashboard:</strong> Tools for staff to manage active issues.</li>
        </ul>
      ),
    },
    SUPPORT: {
      title: 'Contact Support',
      icon: <HelpCircle className="w-6 h-6 text-primary-500" />,
      content: (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          <p>
            For questions or technical assistance regarding the CivicShield demonstration platform, please contact the project team.
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">
            Note: This is a demonstration environment. Do not submit real personal emergencies here.
          </p>
        </div>
      ),
    },
    FAQ: {
      title: 'Help & FAQ',
      icon: <BookOpen className="w-6 h-6 text-primary-500" />,
      content: (
        <div className="space-y-4">
          {[
            { q: "How do I submit a complaint?", a: "Navigate to your Citizen Dashboard and click 'New Report'. Fill in the details, pin the location, and submit." },
            { q: "Where can I find my tracking ID?", a: "Your Tracking ID is generated immediately upon submission and can be found in 'My Complaints' or at the top of your Complaint Details page." },
            { q: "Can I upload photo evidence?", a: "Yes, you can upload images when creating a complaint to help officers understand the issue better." },
            { q: "How do complaint status updates work?", a: "Officers update the status (e.g., In Progress, Resolved). These updates appear instantly on your timeline." },
            { q: "Why does my complaint have an AI priority level?", a: "CivicShield uses AI to read your description and automatically suggest an initial priority to help officers triage urgent issues faster." }
          ].map((faq, i) => (
            <div key={i} className="border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
              <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{faq.q}</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
            </div>
          ))}
        </div>
      ),
    },
    PRIVACY: {
      title: 'Privacy Policy',
      icon: <Shield className="w-6 h-6 text-primary-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p><strong>Information Collected:</strong> CivicShield collects your name, email, phone number, and location data specifically related to the complaints you submit.</p>
          <p><strong>Purpose of Collection:</strong> This information is strictly used to authenticate your identity, track your complaints, and allow officers to contact you if clarification is needed.</p>
          <p><strong>Evidence Usage:</strong> Uploaded evidence is securely stored and used only to process your complaint.</p>
          <p><strong>Handling:</strong> All user information is handled securely for complaint processing purposes. Data is not shared with third-party marketing services.</p>
        </div>
      ),
    },
    TERMS: {
      title: 'Terms of Use',
      icon: <BookOpen className="w-6 h-6 text-primary-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>By accessing the CivicShield demonstration platform, you agree to these usage terms:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You will use the platform only for its intended civic reporting purposes.</li>
            <li>You will not upload malicious files, scripts, or inappropriate content.</li>
            <li>You acknowledge that this is a demonstration environment.</li>
            <li>Do not rely on this platform for life-threatening emergencies. Call emergency services instead.</li>
          </ul>
        </div>
      ),
    },
    SECURITY: {
      title: 'Platform Security',
      icon: <Lock className="w-6 h-6 text-primary-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>CivicShield implements robust, modern security measures to protect user data and maintain platform integrity:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Authentication:</strong> Secure stateless JWT authentication.</li>
            <li><strong>Password Hashing:</strong> Strong, one-way password hashing (Argon2) protecting credentials.</li>
            <li><strong>Role-Based Access:</strong> Strict access control ensuring only authorized officers and admins can manage complaints.</li>
            <li><strong>Protected APIs:</strong> All sensitive endpoints require verified authorization headers.</li>
            <li><strong>Secure Files:</strong> Uploaded evidence is protected and validated against malicious payloads.</li>
          </ul>
        </div>
      ),
    },
  };

  const { title, icon, content } = contentMap[contentType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {content}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default InfoModal;
