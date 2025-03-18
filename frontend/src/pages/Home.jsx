import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Home() {
  const navigate = useNavigate()
  const [passwords, setPasswords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [selectedPassword, setSelectedPassword] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [copySuccess, setCopySuccess] = useState('')

  useEffect(() => {
    const fetchPasswords = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/password-entries/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        setPasswords(response.data)
      } catch (error) {
        console.error('Error fetching passwords:', error)
        setError('Failed to load passwords')
        if (error.response?.status === 401) {
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPasswords()
  }, []) // Empty dependency array - only runs once on mount

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const newPassword = {
        website: formData.get('website'),
        username: formData.get('username'),
        password: formData.get('password'),
        user: user.id  // Send user ID from user object
      }

      const response = await axios.post('http://127.0.0.1:8000/api/password-entries/',
        newPassword,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        setPasswords(prevPasswords => [...prevPasswords, response.data])
        e.target.reset()
        setError(null)
      }
    } catch (error) {
      console.error('Error adding password:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      } else {
        setError(error.response?.data?.message || 'Failed to add password')
      }
    }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/password-entries/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        data: {
          user: user.id  // Include user ID in delete request
        }
      })
      setPasswords(prevPasswords => prevPasswords.filter(p => p.id !== id))
      setError(null)
    } catch (error) {
      console.error('Error deleting password:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      } else if (error.response?.status === 403) {
        setError('You do not have permission to delete this password')
      } else {
        setError('Failed to delete password')
      }
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopySuccess('Copied!')
    setTimeout(() => setCopySuccess(''), 2000)
  }

  const handleView = async (id) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/password-entries/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      setSelectedPassword(response.data)
      setShowDetails(true)
    } catch (error) {
      console.error('Error fetching password details:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      } else {
        setError('Failed to load password details')
      }
    }
  }

  const PasswordDetailsModal = () => {
    if (!showDetails || !selectedPassword) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-[480px] shadow-2xl rounded-xl bg-white">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => {
                setShowDetails(false)
                setSelectedPassword(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Password Details</h3>
          <div className="space-y-6">
            {['website', 'username', 'password'].map((field) => (
              <div key={field} className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 capitalize mb-2">{field}</label>
                <div className="flex items-center justify-between">
                  <p className="text-lg text-gray-900">{selectedPassword[field]}</p>
                  <button
                    onClick={() => handleCopy(selectedPassword[field])}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>{copySuccess === field ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
              <p className="text-lg text-gray-900">
                {new Date(selectedPassword.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Password Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Password</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {['website', 'username', 'password'].map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize mb-2">
                      {field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      id={field}
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Add Password
                </button>
              </form>
            </div>
          </div>

          {/* Password List */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white shadow-lg rounded-xl divide-y divide-gray-100">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Passwords</h2>
              </div>
              {passwords.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No passwords saved yet.
                </div>
              ) : (
                passwords.map((password) => (
                  <div key={password.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-gray-900">{password.website}</h3>
                        <p className="text-gray-500">{password.username}</p>
                        <p className="font-mono text-sm text-gray-700">{password.password}</p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(password.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleView(password.id)}
                          className="inline-flex items-center px-3 py-2 border border-indigo-100 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          View Details
                        </button>
                        {password.user === user.id && (
                          <button
                            onClick={() => handleDelete(password.id)}
                            className="inline-flex items-center px-3 py-2 border border-red-100 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <PasswordDetailsModal />
    </div>
  )
}