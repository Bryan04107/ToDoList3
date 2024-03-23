import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth, sendPasswordReset, logout } from "./firebase";
import "./Profile.css";
import { Row, Col } from "react-bootstrap";

function Profile() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const handlePasswordReset = () => {
    if (user) {
      sendPasswordReset(user.email)
        .then(() => {
          // Show a notification or redirect to a confirmation page
        })
        .catch((error) => {
          console.error("Error sending password reset email:", error);
          // Handle error, show error message, or redirect to an error page
        });
    }
  };

  const handleLogout = () => {
    logout();
    // Redirect to the login page
    navigate("/");
  };

  return (
    <div>
      <div className="profile-header">
        <Row>
          <Col
            className="text-start"
            style={{ fontSize: "48px", marginBottom: 10, paddingLeft: 25 }}
          >
            Profile Page
          </Col>
          <Col
            className="text-end"
            style={{ fontSize: "24px", marginBottom: 10, paddingRight: 25 }}
          >
            <div className="profile-detail-box">
              {user && user.displayName ? user.displayName : "User"}
            </div>
          </Col>
        </Row>
      </div>

      <div className="profile-email-title">Account Email:</div>
      <div className="profile-email">
        {user && user.email ? user.email : "No Email"}
      </div>
      <div className="profile-action">
        <button className="profile-buttons" onClick={handlePasswordReset}>
          Change Password
        </button>
        <button className="profile-buttons" onClick={handleLogout}>
          Logout
        </button>
        <Link to="/" className="profile-back">
          Back
        </Link>
      </div>
    </div>
  );
}

export default Profile;
