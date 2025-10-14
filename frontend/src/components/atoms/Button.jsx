/* eslint-disable react/prop-types */

/**
 * Button atom
 * Props: variant: 'primary' | 'secondary' | 'ghost', children, ...rest
 */
const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-white text-indigo-600 border border-gray-300 hover:bg-gray-50',
  ghost: 'bg-transparent text-indigo-600 hover:underline',
}

const Button = ({ variant = 'primary', className = '', children, ...rest }) => {
  const v = variants[variant] || variants.primary
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium shadow-sm ${v} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
