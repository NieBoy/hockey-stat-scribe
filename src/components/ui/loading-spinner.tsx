
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
