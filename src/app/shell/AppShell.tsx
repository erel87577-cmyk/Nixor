import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            N
          </span>
          <div>
            <p className="eyebrow">Personal vault</p>
            <strong>Nixor</strong>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Library
          </NavLink>
          <NavLink
            to="/import"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Import
          </NavLink>
          <NavLink
            to="/posts/post-001"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Source Detail
          </NavLink>
          <NavLink
            to="/assets/asset-001"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Asset Detail
          </NavLink>
        </nav>
      </aside>

      <div className="content-frame">
        <Outlet />
      </div>
    </div>
  );
}
