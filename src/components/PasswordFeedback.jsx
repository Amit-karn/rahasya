import React, { useState } from "react";
import PropTypes from "prop-types";
import { Typography, Button, Collapse } from "@mui/material";
import { Warning, Info, Lock } from "@mui/icons-material";

const PasswordFeedback = ({
  passwordStrength,
  passwordWarnings,
  passwordSuggestions,
  passwordCrackDetails,
}) => {
  const [showWarnings, setShowWarnings] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPasswordCrackDetails, setShowPasswordCrackDetails] =
    useState(false);
  const getPasswordStrengthColor = (strength) => {
    switch (strength.toLowerCase()) {
      case "weak":
        return "error.main";
      case "medium":
        return "warning.main";
      case "strong":
        return "success.main";
      default:
        return "text.secondary";
    }
  };

  return (
    <>
      {passwordStrength && (
        <Typography
          variant="body2"
          sx={{ color: getPasswordStrengthColor(passwordStrength) }}
        >
          Password Strength: {passwordStrength}
        </Typography>
      )}
      {Array.isArray(passwordWarnings) && passwordWarnings.length > 0 && (
        <>
          <Button
            variant="text"
            color="warning"
            startIcon={<Warning />}
            onClick={() => setShowWarnings(!showWarnings)}
          >
            Show Warnings
          </Button>
          <Collapse in={showWarnings}>
            <Typography variant="body2" color="warning" component="div" mt={1}>
              {passwordWarnings.map((warning, index) => (
                <Typography
                  key={index}
                  component="li"
                  sx={{ ml: 2, fontSize: "0.8rem" }}
                >
                  {warning}
                </Typography>
              ))}
            </Typography>
          </Collapse>
        </>
      )}
      {Array.isArray(passwordSuggestions) && passwordSuggestions.length > 0 && (
        <>
          <Button
            variant="text"
            color="info"
            startIcon={<Info />}
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            Show Suggestions
          </Button>
          <Collapse in={showSuggestions}>
            <Typography variant="body2" color="info" component="div" mt={1}>
              {passwordSuggestions.map((suggestion, index) => (
                <Typography
                  key={index}
                  component="li"
                  sx={{ ml: 2, fontSize: "0.875rem" }}
                >
                  {suggestion}
                </Typography>
              ))}
            </Typography>
          </Collapse>
        </>
      )}
      {Array.isArray(passwordCrackDetails) && passwordCrackDetails.length > 0 && (
        <>
          <Button
            variant="text"
            color="info"
            startIcon={<Lock />}
            onClick={() =>
              setShowPasswordCrackDetails(!showPasswordCrackDetails)
            }
          >
            Show Password Crack Details
          </Button>
          <Collapse in={showPasswordCrackDetails}>
            <Typography variant="body2" color="info" component="div" mt={1}>
              {passwordCrackDetails.map((detail, index) => (
                <Typography
                  key={index}
                  component="li"
                  sx={{ ml: 2, fontSize: "0.875rem" }}
                >
                  {detail}
                </Typography>
              ))}
            </Typography>
          </Collapse>
        </>
      )}
    </>
  );
};

PasswordFeedback.propTypes = {
  passwordStrength: PropTypes.string,
  passwordWarnings: PropTypes.arrayOf(PropTypes.string),
  passwordSuggestions: PropTypes.arrayOf(PropTypes.string),
  passwordCrackDetails: PropTypes.arrayOf(PropTypes.string),
};

export default PasswordFeedback;
