import React, { useState } from "react";
import PropTypes from "prop-types";
import { Typography, Button, Collapse, Box, Stack, Chip } from "@mui/material";
import {
  Warning,
  Info,
  HardwareOutlined,
  Check,
  Close,
  KeyboardArrowUp,
  KeyboardArrowDown
} from "@mui/icons-material";
import { checkPasswordStrength } from "../utils/PasswordStrengthUtils";

const FeedbackSection = ({
  title,
  items,
  icon: Icon,
  color,
  isOpen,
  onToggle
}) => (
  <Box
    sx={{
      borderColor: `${color}.light`,
      borderRadius: 1,
      overflow: "hidden"
    }}
  >
    <Button
      fullWidth
      variant="outlined"
      color={color}
      onClick={onToggle}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        backgroundColor: `${color}.lighter`
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Icon />
        <Typography>{title}</Typography>
      </Box>
      {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
    </Button>
    <Collapse in={isOpen}>
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        {items.map((item, index) => (
          <Typography
            key={index}
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: `${color}.main`,
              fontSize: "0.875rem",
              "&:not(:last-child)": { mb: 1 }
            }}
          >
            <Icon fontSize="small" />
            {item}
          </Typography>
        ))}
      </Box>
    </Collapse>
  </Box>
);

const PasswordFeedback = ({ password }) => {
  const [openSections, setOpenSections] = useState({
    warnings: false,
    suggestions: false,
    analysis: false
  });

  // Calculate strength and feedback on each render
  const { strength, warning, suggestions, passwordCrackDetails } = password
    ? checkPasswordStrength(password)
    : { strength: "", warning: [], suggestions: [], passwordCrackDetails: [] };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPasswordStrengthColor = (strength) => {
    const styles = {
      weak: { color: "error", icon: <Close fontSize="small" /> },
      medium: { color: "warning", icon: <Info fontSize="small" /> },
      strong: { color: "success", icon: <Check fontSize="small" /> }
    };
    return styles[strength.toLowerCase()] || { color: "default", icon: null };
  };

  if (!password) {
    return null;
  }

  const strengthStyle = getPasswordStrengthColor(strength);

  const feedbackSections = [
    {
      id: "warnings",
      title: "Password Warnings",
      icon: Warning,
      color: "warning",
      items: warning,
      isOpen: openSections.warnings
    },
    {
      id: "suggestions",
      title: "Improvement Suggestions",
      icon: Info,
      color: "info",
      items: suggestions,
      isOpen: openSections.suggestions
    },
    {
      id: "analysis",
      title: "Password Analysis Details",
      icon: HardwareOutlined,
      color: "primary",
      items: passwordCrackDetails,
      isOpen: openSections.analysis
    }
  ];

  return (
    <Box sx={{ mt: 2 }}>
      {strength && (
        <Chip
          label={`Strength: ${strength}`}
          color={strengthStyle.color}
          icon={strengthStyle.icon}
          sx={{
            mb: 2,
            fontWeight: 500,
            "& .MuiChip-icon": {
              color: "inherit"
            }
          }}
          size="small"
        />
      )}

      <Stack spacing={1}>
        {feedbackSections.map(
          (section) =>
            Array.isArray(section.items) &&
            section.items.length > 0 && (
              <FeedbackSection
                key={section.id}
                title={section.title}
                items={section.items}
                icon={section.icon}
                color={section.color}
                isOpen={section.isOpen}
                onToggle={() => toggleSection(section.id)}
              />
            )
        )}
      </Stack>
    </Box>
  );
};

FeedbackSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

PasswordFeedback.propTypes = {
  password: PropTypes.string.isRequired
};

export default PasswordFeedback;
