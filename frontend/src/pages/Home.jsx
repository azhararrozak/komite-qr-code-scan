import MainLayouts from '../layouts/MainLayouts'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <MainLayouts>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Build auth in minutes</h1>
              <p className="mt-4 text-lg text-gray-600">A small starter template for authentication using React, Vite and TailwindCSS. Register, login, and protect routes with a simple localStorage-based AuthService.</p>

              <div className="mt-8 flex gap-3">
                <Link to="/auth/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Get started</Link>
                <Link to="/auth/login" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50">Sign in</Link>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <img className="w-full rounded shadow" src="/vite.svg" alt="illustration" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why choose this starter?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-lg font-medium">Protected Routes</h3>
              <p className="mt-2 text-sm text-gray-600">Easily protect pages using route wrappers so only authenticated users can access private pages.</p>
            </div>

            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-lg font-medium">Simple Auth Service</h3>
              <p className="mt-2 text-sm text-gray-600">AuthService uses localStorage for demo purposes and integrates with a backend via axios.</p>
            </div>

            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-lg font-medium">Tailwind + Vite</h3>
              <p className="mt-2 text-sm text-gray-600">Fast dev server and utility-first styling so you can build UIs quickly.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-gray-600">© {new Date().getFullYear()} SatuDev. All rights reserved.</div>
          <div className="mt-4 sm:mt-0 space-x-4">
            <Link to="/" className="text-sm text-indigo-600">Home</Link>
            <Link to="/auth/login" className="text-sm text-gray-600">Login</Link>
            <Link to="/auth/register" className="text-sm text-gray-600">Register</Link>
          </div>
        </div>
      </footer>
    </MainLayouts>
  )
}

export default Home