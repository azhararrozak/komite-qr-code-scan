/* eslint-disable react/prop-types */
import Input from '../atoms/Input'

const FormField = ({ id, label, type = 'text', value, onChange, placeholder, hint, error }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="mt-1">
        <Input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      </div>
      {hint && <p className="mt-2 text-sm text-gray-500">{hint}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FormField
