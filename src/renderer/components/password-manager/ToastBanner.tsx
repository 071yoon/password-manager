type ToastType = 'success' | 'error';

type ToastBannerProps = {
  message: string;
  type: ToastType;
};

export function ToastBanner({ message, type }: ToastBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`vault-fade-up fixed inset-x-0 top-4 z-[90] mx-auto w-fit max-w-[88vw] rounded-sm border px-4 py-2 text-center text-sm font-medium shadow-sm ${
        type === 'success'
          ? 'border-emerald-300/70 bg-emerald-500 text-white shadow-emerald-700/20'
          : 'border-rose-300/80 bg-rose-500 text-white shadow-rose-700/20'
      }`}
    >
      {message}
    </div>
  );
}
