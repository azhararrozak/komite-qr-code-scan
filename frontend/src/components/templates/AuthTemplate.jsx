/* eslint-disable react/prop-types */
import SiteHeader from '../organisms/Homepage/SiteHeader'

const AuthTemplate = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="max-w-3xl mx-auto py-12 px-4">{children}</main>
    </div>
  )
}

export default AuthTemplate
