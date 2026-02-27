import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../state/AuthContext.jsx";

export default function Layout() {
  const { user, setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  function logout() {
    setToken("");
    setUser(null);
    navigate("/");
  }

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="topbarInner">
          <Link to="/" className="brand">
            ThreadsBlog
          </Link>

          <nav className="nav">
            <NavLink to="/" className="navLink">
              Feed
            </NavLink>

            {user && (
              <NavLink to="/new" className="navLink">
                New
              </NavLink>
            )}

            {user && (
              <NavLink to="/profile" className="navLink">
                Profile
              </NavLink>
            )}

            {user?.isAdmin && (
              <NavLink to="/admin" className="navLink">
                Admin
              </NavLink>
            )}
          </nav>

          <div className="topbarActions">
            {!user ? (
              <>
                <Link to="/login" className="btn btnSoft">
                  Login
                </Link>
                <Link to="/register" className="btn btnDark">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="whoami">
                  <div className="avatar">{user.username?.slice(0, 1)?.toUpperCase()}</div>
                  <div className="whoamiText">
                    <div className="whoamiName">{user.username}</div>
                    <div className="whoamiRole">{user.isAdmin ? "Admin" : "User"}</div>
                  </div>
                </div>
                <button className="btn btnOutline" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container footerInner">
          <div>Prototype Blog App</div>
          <div className="muted">s87 In class Prototyping</div>
        </div>
      </footer>
    </div>
  );
}