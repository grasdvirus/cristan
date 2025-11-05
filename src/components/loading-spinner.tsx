export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <video
        src="/charge.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}
