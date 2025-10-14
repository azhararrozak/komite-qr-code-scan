/* eslint-disable react/prop-types */
const Input = ({ id, name, type = 'text', value, onChange, placeholder, className = '', ...rest }) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
      {...rest}
    />
  )
}

export default Input
