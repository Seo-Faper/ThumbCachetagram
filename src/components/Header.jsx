import React from "react";
import "galmuri/dist/galmuri.css";
class Header extends React.Component {
  render() {
    return (
      <nav className="Nav">
        <div className="Nav-menus">
          <div className="Nav-brand">
            <a
              className="Nav-brand-logo"
              href="/"
              style={{
                fontFamily: "Galmuri11, sans-serif",
                fontSize: "20px",
                fontStyle: "blod",
              }}
            >
              Team d4c
            </a>
          </div>
        </div>
      </nav>
    );
  }
}
export default Header;
