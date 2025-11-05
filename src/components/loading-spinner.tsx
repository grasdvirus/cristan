export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <video
        src="/charge.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-48 h-48 object-cover"
      />
    </div>
  );
}
