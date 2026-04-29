import { useMemo } from 'react';

export type ContentViewerProps = {
  title?: string;
  source?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

const isYouTube = (value: string) => /youtube\.com|youtu\.be/i.test(value);
const isVimeo = (value: string) => /vimeo\.com/i.test(value);

const resolveUrl = (value?: string | null) => {
  const input = String(value || '').trim();
  if (!input) return '';
  if (/^https?:\/\//i.test(input) || input.startsWith('blob:') || input.startsWith('data:')) return input;
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const backendBase = apiBase.replace(/\/api\/?$/, '');
  return `${backendBase}${input.startsWith('/') ? '' : '/'}${input}`;
};

export const ContentViewer = ({ title, source, mimeType, fileName }: ContentViewerProps) => {
  const url = useMemo(() => resolveUrl(source), [source]);
  const mime = String(mimeType || '').toLowerCase();
  const extension = (fileName || url).split('.').pop()?.toLowerCase() || '';
  const isVideo = mime.startsWith('video/') || ['mp4', 'webm'].includes(extension);
  const isPdf = mime.includes('pdf') || extension === 'pdf';
  const isImage = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);
  const isDoc = ['doc', 'docx', 'ppt', 'pptx'].includes(extension) || mime.includes('msword') || mime.includes('presentation');

  if (!url) {
    return <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-steel-300">No preview available.</div>;
  }

  if (isYouTube(url) || isVimeo(url)) {
    const embed = isYouTube(url)
      ? `https://www.youtube.com/embed/${new URL(url).searchParams.get('v') || url.split('/').pop()}`
      : `https://player.vimeo.com/video/${url.split('/').pop()}`;
    return <iframe title={title || 'Embedded content'} src={embed} className="aspect-video w-full rounded-2xl border border-white/10" allowFullScreen />;
  }

  if (isVideo) {
    return <video controls className="w-full rounded-2xl border border-white/10 bg-black"><source src={url} type={mime || undefined} />Your browser does not support video playback.</video>;
  }

  if (isPdf) {
    return <iframe title={title || 'PDF preview'} src={url} className="h-[70vh] w-full rounded-2xl border border-white/10 bg-white" />;
  }

  if (isImage) {
    return <img src={url} alt={title || 'Preview'} className="max-h-[70vh] w-full rounded-2xl border border-white/10 object-contain" />;
  }

  if (isDoc) {
    return (
      <div className="panel p-5">
        <div className="text-sm text-steel-300">Preview is limited for office documents.</div>
        <div className="mt-3 flex gap-3">
          <a className="btn-primary" href={url} target="_blank" rel="noreferrer">Open</a>
          <a className="btn-secondary" href={url} download={fileName || undefined}>Download</a>
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-5">
      <div className="text-sm text-steel-300">External or unsupported file.</div>
      <div className="mt-3 flex gap-3">
        <a className="btn-primary" href={url} target="_blank" rel="noreferrer">Open Link</a>
        <a className="btn-secondary" href={url} download={fileName || undefined}>Download</a>
      </div>
    </div>
  );
};
