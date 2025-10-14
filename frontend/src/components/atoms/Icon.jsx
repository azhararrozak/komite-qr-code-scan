/* eslint-disable react/prop-types */
const Icon = ({ name, className = '' }) => {
  // small set of icons; extend as needed
  const icons = {
    eye: (
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3C5 3 1.73 6.11.5 10c1.23 3.89 4.5 7 9.5 7s8.27-3.11 9.5-7C18.27 6.11 15 3 10 3zm0 12a5 5 0 110-10 5 5 0 010 10z" />
        <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  }

  return icons[name] || null
}

export default Icon
