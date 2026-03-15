const Stars = ({ value = 0, size = 'text-sm' }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const filled = i < full;
    const halfStar = i === full && half;
    stars.push(
      <svg
        key={i}
        className={`w-4 h-4 ${size} ${filled || halfStar ? 'text-yellow-400' : 'text-gray-300'}`}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.57a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.9 20.507a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.57a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          fill={filled || halfStar ? 'currentColor' : 'none'}
        />
      </svg>
    );
  }
  return <div className="flex items-center gap-1">{stars}</div>;
};

export default Stars;
