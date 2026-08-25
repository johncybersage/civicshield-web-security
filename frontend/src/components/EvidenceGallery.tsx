import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, ImageIcon } from 'lucide-react';

interface EvidenceGalleryProps {
  evidence: Array<{ id: number; file_name?: string }>;
  evidenceUrls: Record<number, string>;
}

const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({ evidence, evidenceUrls }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === 'Escape') setLightboxIndex(null);
    if (e.key === 'ArrowRight' && lightboxIndex < evidence.length - 1) setLightboxIndex(lightboxIndex + 1);
    if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
  }, [lightboxIndex, evidence.length]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, handleKeyDown]);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No evidence images attached</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Evidence photos will appear here when uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidence.map((ev, index) => (
          <button
            key={ev.id}
            onClick={() => setLightboxIndex(index)}
            className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 aspect-square flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={`View evidence image ${index + 1}`}
          >
            {!evidenceUrls[ev.id] ? (
              <Loader2 className="w-6 h-6 text-slate-300 dark:text-slate-600 animate-spin" />
            ) : (
              <>
                <img
                  src={evidenceUrls[ev.id]}
                  alt={`Evidence ${index + 1}${ev.file_name ? `: ${ev.file_name}` : ''}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e2e8f0" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="10">Unavailable</text></svg>';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-opacity">
                    View Full
                  </span>
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && evidence[lightboxIndex] && (
        <div 
          className="lightbox-overlay"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {lightboxIndex < evidence.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div
            className="max-w-4xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {evidenceUrls[evidence[lightboxIndex].id] ? (
              <img
                src={evidenceUrls[evidence[lightboxIndex].id]}
                alt={`Evidence ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {evidence.length}
          </div>
        </div>
      )}
    </>
  );
};

export default EvidenceGallery;
