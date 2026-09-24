import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom'
import { supabase } from './lib/supabase'
import './App.css'

function Logo() {
  return (
    <Link to="/" className="logo">
      CHESS<span>NUTS</span>
    </Link>
  )
}

/* =========================
   HOME
========================= */

function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return <div className="auth-page">Loading...</div>
  }

  return (
    <div className="page">
      <header className="header">
        <div className="container header-inner">
          <Logo />

          {!user ? (
            <div className="header-buttons">
              <Link to="/login">
                <button className="btn btn-ghost">
                  Login
                </button>
              </Link>

              <Link to="/signup">
                <button className="btn btn-primary">
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <div className="header-buttons">
              <Link to="/account">
                <button className="btn btn-ghost">
                  Account
                </button>
              </Link>

              <button
                className="btn btn-ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {!user ? (
        <main className="hero">
          <div className="container">
            <div className="hero-content">
              <h1>
                CHESS<span>NUTS</span>
              </h1>

              <p>
                Chess. Learning. Community.
              </p>

              <div className="buttons">
                <Link to="/signup">
                  <button className="btn btn-primary">
                    Get Started
                  </button>
                </Link>

                <Link to="/login">
                  <button className="btn btn-ghost">
                    I already have an account
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="dashboard">
          <div className="container">
            <div className="welcome">
              <h1>
                Welcome back,{' '}
                {user.user_metadata?.display_name || user.email}
              </h1>

              <p>
                What would you like to do today?
              </p>
            </div>

            <div className="apps">
              <div className="app-card">
                <h2>Chessnuts Academy</h2>

                <p>
                  Your chess lessons, schedules,
                  progress and more.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    alert('Academy coming soon!')
                  }
                >
                  Open Academy
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

/* =========================
   ACCOUNT
========================= */

function Account() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAccount() {
      setLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      setProfile(profileData)

      const loadedRoles = []

      const roleTables = [
        ['ADMIN', 'admins'],
        ['COACH', 'coaches'],
        ['STUDENT', 'students'],
        ['PARENT', 'parents'],
      ]

      for (const [role, table] of roleTables) {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!error && data) {
          loadedRoles.push(role)
        }
      }

      setRoles(loadedRoles)
      setLoading(false)
    }

    loadAccount()
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="auth-page">
        Loading...
      </div>
    )
  }

  return (
    <div className="page">
      <header className="header">
        <div className="container header-inner">
          <Logo />

          <div className="header-buttons">
            <Link to="/">
              <button className="btn btn-ghost">
                Home
              </button>
            </Link>

            <button
              className="btn btn-ghost"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <div className="container account-page">
          <div className="welcome">
            <h1>Account</h1>
            <p>
              Your global Chessnuts account.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="apps">
            <div className="app-card">
              <h2>Profile</h2>

              <div className="account-info">
                <div>
                  <strong>Name</strong>
                  <span>
                    {profile?.display_name ||
                      user.user_metadata?.display_name ||
                      '-'}
                  </span>
                </div>

                <div>
                  <strong>Email</strong>
                  <span>{user.email}</span>
                </div>

                <div>
                  <strong>Phone</strong>
                  <span>
                    {profile?.phone ||
                      user.user_metadata?.phone ||
                      '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="app-card">
              <h2>My Roles</h2>

              {roles.length === 0 ? (
                <p>
                  You don't have any roles yet.
                </p>
              ) : (
                <div className="roles">
                  {roles.map((role) => (
                    <div
                      className="role-badge"
                      key={role}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="app-card">
              <h2>Request a Role</h2>

              <p>
                Want access to another part of
                Chessnuts?
              </p>

              <Link to="/account/request-role">
                <button className="btn btn-primary">
                  Request Role
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* =========================
   REQUEST ROLE
========================= */

function RequestRole() {
  const navigate = useNavigate()

  const [role, setRole] = useState('STUDENT')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleRequest(e) {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    const { error } = await supabase.rpc(
      'request_role',
      {
        p_role: role,
      }
    )

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage(
      `Your request for the ${role} role has been submitted.`
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <Logo />
        </div>

        <h1>Request a Role</h1>

        <p className="auth-subtitle">
          Request access to another Chessnuts role.
        </p>

        <form onSubmit={handleRequest}>
          <div className="form-group">
            <label>Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="STUDENT">
                Student
              </option>

              <option value="PARENT">
                Parent
              </option>

              <option value="COACH">
                Coach
              </option>
            </select>
          </div>

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Submitting...'
              : 'Submit Request'}
          </button>
        </form>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        <button
          className="auth-back"
          onClick={() => navigate('/account')}
        >
          ← Back to Account
        </button>
      </div>
    </div>
  )
}

/* =========================
   LOGIN
========================= */

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <Logo />
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Login to your Chessnuts account.
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>
        </form>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <Link to="/" className="auth-back">
          ← Back to Chessnuts
        </Link>
      </div>
    </div>
  )
}

/* =========================
   SIGNUP
========================= */

function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()

    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            phone,
          },
        },
      })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data.session) {
      navigate('/')
      return
    }

    setMessage(
      'Account created. Please check your email to confirm your account.'
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <Logo />
        </div>

        <h1>Create account</h1>

        <p className="auth-subtitle">
          Join the Chessnuts community.
        </p>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Sign Up'}
          </button>
        </form>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        <Link to="/" className="auth-back">
          ← Back to Chessnuts
        </Link>
      </div>
    </div>
  )
}

/* =========================
   APP
========================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />
        <Route
          path="/account/request-role"
          element={<RequestRole />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
