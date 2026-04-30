import React, { useState } from "react";
import { loginUser } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      login(res.token, res.user);
      toast.success("Welcome to PharmaCare!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-page-container">
      {/* University Style White Animated Background */}
      <div className="white-anim-bg">
        <div className="shape-circle sc-1"></div>
        <div className="shape-circle sc-2"></div>
        <div className="shape-circle sc-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
           <h2 className="brand-name">PHARMA<span>CARE</span></h2>
           <p className="sub-text">Please enter your details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="user@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;