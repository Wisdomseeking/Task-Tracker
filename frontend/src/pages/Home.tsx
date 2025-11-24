import { Link } from "react-router-dom";
import "./Home.css"; 

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="title">Task Manager</h1>
      <p className="subtitle">Stay organized. Stay productive.</p>

      <div className="home-buttons">
        <Link to="/login" className="btn login-btn">Login</Link>
        <Link to="/register" className="btn register-btn">Register</Link>
      </div>
    </div>
  );
}
