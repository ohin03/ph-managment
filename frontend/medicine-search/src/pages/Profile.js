import React, { useState } from "react";
import { changeCredentials } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth(); 
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Avatar Logic
  const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : 
                     (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changeCredentials({ oldPassword, newPassword, newEmail });
      toast.success("Profile updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setNewEmail("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card shadow-lg border-0 p-3">
        
   

    

        <div className="profile-body px-4 pb-4">
          <div className="security-title mb-4 ">
            <h5 className="mb-0 text-center mb-3 p2"><i className="fa fa-user-shield me-2 text-warning "></i> Security Settings</h5>
            <small className="text-muted">Update your account credentials safely</small>
          </div>
          
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="row text-center">
              <div className="col-md-12 mb-3">
                <div className="form-floating">
                  <input
                    type="email"
                    className="form-control"
                    id="newEmail"
                    placeholder="New Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    autoComplete="off"
                  />
                  <label htmlFor="newEmail">Change Email Address</label>
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="newPass"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <label htmlFor="newPass">New Password</label>
                </div>
              </div>

              <div className="col-md-12 mb-4">
                <div className="form-floating border-warning">
                  <input
                    type="password"
                    className="form-control current-pass-highlight"
                    id="oldPass"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <label htmlFor="oldPass" className="text-danger fw-bold">Current Password (Required) *</label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary-pro w-100 py-3 fw-bold shadow">
              UPDATE PROFILE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;