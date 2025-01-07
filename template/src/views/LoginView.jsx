// src/components/LoginView.js

import React, { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { Input } from "liamc9npm"; // Ensure this is a reusable Input component
import { GoogleIcon } from "liamc9npm"; // Make icon paths configurable or abstract
import "react-toastify/dist/ReactToastify.css";

const LoginView = ({
  handleSignup,        // Function to handle signup (passed from Login component)
  handleLogin,         // Function to handle login (passed from Login component)
  onForgotPassword,    // Function to handle forgot password (passed from Login component)
  onGoogleSignIn,      // Function to handle Google sign-in (passed from Login component)
  themeColor = "#A855F7",
  branding = {
    appName: "YourApp",
    primaryIcon: null, // Allow passing a custom primary icon
  },
}) => {
  const { appName, primaryIcon } = branding;

  // Local state management
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      if (password !== reenterPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!termsAccepted) {
        setError("You must accept the terms and conditions.");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await handleSignup({ email, password, setIsSignupComplete, setError });
      } else {
        await handleLogin({ email, password, setError });
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler to toggle between login and signup views
  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setResetEmailSent(false);
  };

  return (
    <Container>
      {isSignupComplete ? (
        <SuccessContainer>
          {primaryIcon && (
            <IconWrapper>
              {React.cloneElement(primaryIcon, { themeColor })}
            </IconWrapper>
          )}
          <Title>Signup Successful!</Title>
          <Message>
            Please check your email <strong>{email}</strong> for a verification link to
            activate your account.
          </Message>
          <ButtonWrapper>
            <Button
              themeColor={themeColor}
              onClick={() => {
                setIsSignupComplete(false);
                setIsSignUp(false);
              }}
            >
              Return to Login
            </Button>
          </ButtonWrapper>
        </SuccessContainer>
      ) : (
        <>
          {primaryIcon && (
            <IconWrapper>
              {React.cloneElement(primaryIcon, { themeColor })}
            </IconWrapper>
          )}
          <Title>{isSignUp ? `Sign up to ${appName} to get started!` : `Sign in to ${appName}`}</Title>
          {resetEmailSent && <Message>A password reset email has been sent to {email}.</Message>}
          {error && <Message error>{error}</Message>}
          <Form onSubmit={handleSubmit}>
            <Input
              name="email"
              id="email"
              type="email"
              label="Email"
              color={themeColor}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              name="password"
              id="password"
              type="password"
              label="Password"
              color={themeColor}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isSignUp && (
              <Input
                name="reenterpassword"
                id="reenterpassword"
                type="password"
                label="Re-enter Password"
                color={themeColor}
                required
                value={reenterPassword}
                onChange={(e) => setReenterPassword(e.target.value)}
              />
            )}
            {isSignUp && (
              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <span>
                  I accept the{" "}
                  <Link themeColor={themeColor} href="/terms">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link themeColor={themeColor} href="/privacy">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </CheckboxWrapper>
            )}
            {!isSignUp && (
              <RememberMeContainer>
                <ForgotPasswordButton
                  themeColor={themeColor}
                  type="button"
                  onClick={() => onForgotPassword({ email, setResetEmailSent, setError })}
                >
                  Forgot your password?
                </ForgotPasswordButton>
              </RememberMeContainer>
            )}
            <ButtonWrapper>
              <Button themeColor={themeColor} type="submit" disabled={isLoading}>
                {isLoading
                  ? isSignUp
                    ? "Signing up..."
                    : "Signing in..."
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </Button>
            </ButtonWrapper>
          </Form>
          <Divider>
            <HorizontalLine />
            <p>or</p>
            <HorizontalLine />
          </Divider>
          <OAuthButton onClick={onGoogleSignIn}>
            <IconWrapper>
              <GoogleIcon />
            </IconWrapper>
            Sign in with Google
          </OAuthButton>
          <LoginWrapper>
            <p>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <LoginLink themeColor={themeColor} onClick={toggleSignUp}>
                {isSignUp ? "Login" : "Sign up"}
              </LoginLink>
            </p>
          </LoginWrapper>
        </>
      )}
    </Container>
  );
};

// PropTypes for better type checking and reusability
LoginView.propTypes = {
  handleSignup: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
  onForgotPassword: PropTypes.func.isRequired,
  onGoogleSignIn: PropTypes.func.isRequired,
  themeColor: PropTypes.string,
  branding: PropTypes.shape({
    appName: PropTypes.string,
    primaryIcon: PropTypes.element,
  }),
};

export default LoginView;

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  @media (max-width: 600px) {
    max-width: 100%;
    padding: 20px 10px;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  text-align: center;
  margin-bottom: 20px;
`;

const Message = styled.p`
  margin: 10px 0;
  font-size: 0.875rem;
  color: ${(props) => (props.error ? "#e74c3c" : "#2ecc71")};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const Link = styled.a`
  color: ${(props) => props.themeColor};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const ButtonWrapper = styled.div`
  margin-top: 24px;
`;

const Button = styled.button`
  width: 100%;
  display: flex;
  justify-content: center;
  border-radius: 8px;
  background-color: ${(props) => props.themeColor};
  color: white;
  padding: 12px;
  font-weight: 500;
  cursor: pointer;

  &:disabled {
    background-color: #d3d3d3;
    cursor: not-allowed;
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  margin-bottom: 10px;
`;

const ForgotPasswordButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.themeColor};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  gap: 16px;
  p {
    margin: 0;
    font-size: 1rem;
    color: #6b7280;
  }
`;

const HorizontalLine = styled.hr`
  flex: 1;
  border: none;
  border-top: 1px solid #d1d5db;
`;

const LoginWrapper = styled.div`
  margin-top: 16px;
  text-align: center;
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.themeColor};
  font-weight: 500;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const OAuthButton = styled.button`
  padding: 12px;
  border: none;
  width: 100%;
  border-radius: 30px;
  border: 2px solid #ccc;
  background-color: #fff;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #ccc;
  }
  &:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 10px;

  svg {
    width: 20px;
    height: 20px;
  }
`;
