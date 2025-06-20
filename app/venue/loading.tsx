export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="h-12 mb-6">
        <img src="/images/tourify-logo-white.png" alt="Tourify Logo" className="h-full" />
      </div>
      <div className="w-16 h-16 border-t-4 border-purple-500 border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-lg">Loading Tourify...</p>
    </div>
  )
}
