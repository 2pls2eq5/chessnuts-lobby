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
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  setUser(user)

  if (user) {
    const {
      data: profileData,
    } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    setProfile(profileData)
  }

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
                {profile?.display_name || user.email}
              </h1>

              <p>
                What would you like to do today?
              </p>
            </div>

            <div className="apps">
{/* =========================
    COMMUNITY
========================= */}

<div className="app-card">
  <h2>Chessnuts Community</h2>

  <p>
    Connect, share and be part of the
    Chessnuts chess community.
  </p>

  <div className="app-card-actions">
    <button
      className="btn btn-primary"
      onClick={() =>
        alert('Community coming soon!')
      }
    >
      Open Community
    </button>
  </div>
</div>
              {/* =========================
                  ACADEMY
              ========================= */}

              <div className="app-card">
                <h2>Chessnuts Academy</h2>

                <p>
                  Your chess lessons, schedules,
                  progress and more.
                </p>
                
                 <div className="app-card-actions">
                  <button
                   className="btn btn-primary"
                   onClick={() =>
                     window.location.href =
      'https://academy.chessnuts.fun'
  }
                 >
                   Open Academy
                 </button>
                 </div>
              </div>

              {/* =========================
                  STUDIO
              ========================= */}

              <div className="app-card">
                <h2>Chessnuts Studio</h2>

                <p>
                  Create and manage Chessnuts
                  broadcasts and programs.
                </p>
                 <div className="app-card-actions">
                  <button
                   className="btn btn-primary"
                   onClick={() =>
                     alert('Studio coming soon!')
                   }
                 >
                   Open Studio
                 </button>
                </div>
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
  const [message, setMessage] = useState('')

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [gender, setGender] = useState('')

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

      /* =========================
         LOAD PROFILE
      ========================= */

      const {
        data: profileData,
        error: profileError,
      } = await supabase
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

      /* =========================
         LOAD ROLES
      ========================= */

      const {
        data: roleData,
        error: roleError,
      } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      if (roleError) {
        setError(roleError.message)
        setLoading(false)
        return
      }

      setRoles(
        (roleData || []).map((item) => item.role)
      )

      setLoading(false)
    }

    loadAccount()
  }, [navigate])

  /* =========================
     START EDITING
  ========================= */

  function handleEdit() {
    setError('')
    setMessage('')

    setUsername(profile?.username || '')
    setDisplayName(profile?.display_name || '')
    setPhone(profile?.phone || '')
    setAddress(profile?.address || '')
    setGender(profile?.gender || '')

    setEditing(true)
  }

  /* =========================
     CANCEL EDITING
  ========================= */

  function handleCancel() {
    setError('')
    setMessage('')
    setEditing(false)
  }

  /* =========================
     SAVE PROFILE
  ========================= */

  async function handleSave(e) {
    e.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    const { error: updateError } =
      await supabase.rpc('update_profile', {
        p_username: username,
        p_display_name: displayName,
        p_phone: phone,
        p_address: address,
        p_gender: gender,
      })

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setProfile((current) => ({
      ...current,
      username: username.trim(),
      display_name: displayName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gender: gender.trim(),
    }))

    setEditing(false)
    setMessage('Profile updated successfully.')
  }

  /* =========================
     LOGOUT
  ========================= */

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

          <div className="profile-actions">
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

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <div className="apps">

            {/* =========================
                PROFILE
            ========================= */}

            <div className="app-card">
              <h2>Profile</h2>

              {!editing ? (
                <>
                  <div className="account-info">

                    <div>
                      <strong>Username</strong>

                      <span>
                        {profile?.username || '-'}
                      </span>
                    </div>

                    <div>
                      <strong>Name</strong>

                      <span>
                        {profile?.display_name || '-'}
                      </span>
                    </div>

                    <div>
                      <strong>Email</strong>

                      <span>
                        {user.email || '-'}
                      </span>
                    </div>

                    <div>
                      <strong>Phone</strong>

                      <span>
                        {profile?.phone || '-'}
                      </span>
                    </div>

                    <div>
                      <strong>Address</strong>

                      <span>
                        {profile?.address || '-'}
                      </span>
                    </div>

                    <div>
                      <strong>Gender</strong>

                      <span>
                        {profile?.gender || '-'}
                      </span>
                    </div>

                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSave}>

                  <div className="form-group">
                    <label>Username</label>

                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Name</label>

                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) =>
                        setDisplayName(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>

                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
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
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>

                    <input
                      type="text"
                      value={address}
                      onChange={(e) =>
                        setAddress(e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>

                    <select
                      value={gender}
                      onChange={(e) =>
                        setGender(e.target.value)
                      }
                    >
                      <option value="">
                        Select gender
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>
                    </select>
                  </div>

                  <div className="header-buttons">
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              )}
            </div>

            {/* =========================
                ROLES
            ========================= */}

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

            {/* =========================
                REQUEST ROLE
            ========================= */}

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

  function getReturnTo() {
    const params = new URLSearchParams(
      window.location.search
    )

    const returnTo = params.get('returnTo')

    if (!returnTo) {
      return null
    }

    try {
      const url = new URL(returnTo)

      if (
        url.protocol === 'https:' &&
        (
          url.hostname === 'chessnuts.fun' ||
          url.hostname.endsWith('.chessnuts.fun')
        )
      ) {
        return url.href
      }
    } catch {
      return null
    }

    return null
  }

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

    const returnTo = getReturnTo()

    if (returnTo) {
      window.location.href = returnTo
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

        <Link
          to="/"
          className="auth-back"
        >
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

  const [username, setUsername] = useState('')
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
            username,
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
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />
          </div>

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
