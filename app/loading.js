export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center h-screen overflow-hidden bg-[#e2e3db]">
      <div className="p-8 bg-white rounded-lg shadow-xl">
        <svg
          className="w-24 h-24 mx-auto mb-4"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            .spinner_V8m1 {
              transform-origin: center;
              animation: spinner_zKoa 2s linear infinite;
            }
            .spinner_V8m1 circle {
              stroke-linecap: round;
              animation: spinner_YpZS 1.5s ease-in-out infinite;
            }
            @keyframes spinner_zKoa {
              100% {transform: rotate(360deg)}
            }
            @keyframes spinner_YpZS {
              0% {stroke-dasharray: 0 150; stroke-dashoffset: 0}
              47.5% {stroke-dasharray: 42 150; stroke-dashoffset: -16}
              95%, 100% {stroke-dasharray: 42 150; stroke-dashoffset: -59}
            }
          `}</style>
          <g className="spinner_V8m1">
            <circle
              cx="12"
              cy="12"
              r="9.5"
              fill="none"
              strokeWidth="3"
              stroke="#3B82F6"
            />
          </g>
        </svg>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Loading
        </h2>
        <p className="text-center text-gray-600">
          Preparing your data, please wait...
        </p>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 animate-pulse">
          Fetching the latest models and metrics
        </p>
      </div>
    </div>
  );
}