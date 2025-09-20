import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
  Tabs,
  Tab
} from "@mui/material";
import {
  Key,
  Description,
  Lock,
  Security,
  CheckCircleOutline,
  FilePresent,
  PlayArrow
} from "@mui/icons-material";
import passwordManagerConfig from "../config/PasswordManagerConfig";

// Tab Panel component
const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: 0 }}>
    {value === index && <Box>{children}</Box>}
  </div>
);

const HowItWorksDialog = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        <Security /> How Rahasya Works
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Encryption Process" />
        <Tab label="Decryption Process" />
      </Tabs>

      <DialogContent dividers>
        {/* Encryption Tab - Full details */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 2 }}>
            {/* Overview */}
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Typography>
              Rahasya (Sanskrit: रहस्य, <i>means secret, mystery, or something hidden</i>) is a secure tool for managing and encrypting sensitive information like passwords, credentials, and secrets. It works completely offline, ensuring your data never leaves your device.
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Master Key Management */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Key /> Master Key Management
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Required First Step" secondary="Create master key before any operations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Key Requirements" secondary={`Length: 10-${passwordManagerConfig.masterKeyMaxLength} characters (but use at least 16 for real security), includes letters, numbers, and symbols.`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Security" secondary="Never stored, only held in memory during session" />
                </ListItem>
              </List>
            </Box>

            {/* Iteration Count Explanation */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Key /> PBKDF2 Iteration Count
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                The iteration count determines how many times your password is processed to make brute-force attacks much harder. Higher values are more secure but may be slower on older devices.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Default:</strong> {passwordManagerConfig.masterKeyDefaultIteraion.toLocaleString()} iterations
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Available options:</strong> {passwordManagerConfig.masterKeyIteraionList.map(n => n.toLocaleString()).join(", ")}
              </Typography>
              <Typography variant="body2" color="warning.main">
                ⚠️ If you change the iteration count, you must remember it for decryption. If you forget the iteration count, master key, or AAD, you cannot decrypt your data.
              </Typography>
            </Box>

            {/* File Operations */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilePresent /> File Operations
              </Typography>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Creating New File:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText secondary="1. Click 'Generate New File' after setting master key" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    secondary={
                      <span>
                        2. Add secrets (Title, Username, Password, Notes)
                        <br />
                        <strong>Optional: Add AAD (Additional Authenticated Data)</strong> for extra security. AAD can be set for each secret individually. If you use AAD for a secret, you must provide the same AAD to decrypt that secret—otherwise, it cannot be decrypted. <br />
                        <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                          If you forget your AAD for a secret, you cannot decrypt that secret.
                        </span>{" "}
                        <a href="/aes-gcm" target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2", fontWeight: 500 }}>
                          (What is AAD?)
                        </a>
                      </span>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText secondary="3. File is automatically encrypted and ready for download" />
                </ListItem>
              </List>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Uploading Existing File:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText secondary="1. Click 'Upload File' and enter master key" />
                </ListItem>
                <ListItem>
                  <ListItemText secondary="2. View and manage existing secrets" />
                </ListItem>
                <ListItem>
                  <ListItemText secondary="3. Download updated file after changes" />
                </ListItem>
              </List>
            </Box>

            {/* Security Features */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Lock /> Security Features
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Offline Functionality" secondary="Works completely offline, once the page is loaded" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Local Processing" secondary="All encryption happens in your browser, no server communication" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={<Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>Strong Encryption <Link href="/aes-gcm" target="_blank" rel="noopener noreferrer" sx={{ fontSize: "0.8rem", color: "primary.main" }}>(Learn more about AES-GCM)</Link></Box>} secondary="AES-GCM encryption, PBKDF2 key derivation, SHA-256 for integrity" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Data Protection" secondary="Automatic memory cleanup, session-only storage, integrity verification" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Additional Authenticated Data (AAD) - Optional" secondary="Extra layer of security that binds encrypted data to its context (optional feature)" />
                </ListItem>
                <ListItem sx={{ pl: 4 }}>
                  <ListItemText secondary="• When enabled, prevents encrypted data from being used in different contexts" />
                </ListItem>
                <ListItem sx={{ pl: 4 }}>
                  <ListItemText secondary="• Provides additional integrity and authenticity verification" />
                </ListItem>
                <ListItem sx={{ pl: 4 }}>
                  <ListItemText secondary="• Optional but recommended for enhanced security" />
                </ListItem>
              </List>
            </Box>

            {/* Technical Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Description /> Technical Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Cryptographic Operations" secondary="Two-level key derivation with PBKDF2, AES-GCM for authenticated encryption" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Integrity Verification" secondary="HMAC-SHA256 for file integrity, prevents unauthorized modifications" />
                </ListItem>
              </List>
            </Box>

            {/* Password Best Practices */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Key /> Password Best Practices
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                A strong password follows ALL THREE of these tips:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="1. Make them long" secondary={<Typography variant="body2" component="div">At least 16 characters—longer is stronger!</Typography>} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="2. Make them random" secondary={<Box component="div"><Typography variant="body2">Two ways to do this:</Typography><Typography variant="body2" sx={{ pl: 2 }}>a) Use a random string of mixed-case letters, numbers and symbols:</Typography><Typography variant="body2" sx={{ pl: 3, color: "success.main" }}>• cXmnZK65rf*&DaaD<br />• Yuc8$RikA34%ZoPPao98t</Typography><Typography variant="body2" sx={{ pl: 2, mt: 1 }}>b) Create a memorable phrase of 4-7 unrelated words (passphrase):</Typography><Typography variant="body2" sx={{ pl: 3 }}>Good: <span style={{ color: "#2e7d32" }}>HorsePurpleHatRun</span><br />Great: <span style={{ color: "#2e7d32" }}>HorsePurpleHatRunBay</span><br />Amazing: <span style={{ color: "#2e7d32" }}>Horse Purple Hat Run Bay Lifting</span></Typography><Typography variant="body2" sx={{ pl: 2, fontStyle: "italic" }}>Note: You can use spaces before or between words if you prefer!</Typography></Box>} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="3. Make them unique" secondary={<Box component="div"><Typography variant="body2">Use a different strong password for each account. For example:</Typography><Typography variant="body2" sx={{ pl: 2, color: "success.main" }}>Bank: k8dfh8c@Pfv0gB2<br />Email: legal tiny facility freehand probable enamel<br />Social media: e246gs%mFs#3tv6</Typography></Box>} />
                </ListItem>
              </List>
            </Box>

            {/* Quick Start */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PlayArrow /> Quick Start
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Initial Setup:
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }} gutterBottom>
                Add Master Key → Generate New File → Add First Secret → Download File
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Adding More Secrets:
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                Upload File → Enter Master Key → Add Secret → Download Updated File
              </Typography>
            </Box>

            {/* Security Warnings */}
            <Box sx={{ backgroundColor: "warning.lighter", p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                Important Security Warnings:
              </Typography>
              <List dense sx={{ pl: 1 }}>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Master Key:</strong> If you forget or lose your master key, there is NO WAY to recover your encrypted data. Keep your master key in a secure location!
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>AAD (Additional Authenticated Data):</strong> If you enable AAD, you must remember both the master key AND the AAD value. Without either, your data cannot be decrypted.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Iteration Count:</strong> If you change the PBKDF2 iteration count, you must remember it for decryption. Forgetting it means you cannot decrypt your data.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Data Security:</strong> The encryption includes additional safeguards to protect against tampering and unauthorized modifications.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Offline Usage:</strong> You can use Rahasya offline - save it to your device for secure access without internet connectivity.
                  </Typography>
                </ListItem>
              </List>
              <Typography variant="body2" color="error.dark" sx={{ mt: 1, fontWeight: "bold", p: 1, bgcolor: "error.lighter", borderRadius: 1 }}>
                ⚠️ NO RECOVERY OPTIONS: There is no way to recover encrypted data if you lose your master key, AAD, or iteration count (if changed). Make sure to keep them secure!
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        {/* Decryption Tab - Full details */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 2 }}>
            {/* Overview */}
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Typography>
              Decrypt your Rahasya file locally in your browser. You must provide the same master key (and AAD, if used) and PBKDF2 iteration count that were used during encryption. No data ever leaves your device.
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Master Key Management */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Key /> Master Key & Required Info
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Required: Master Key" secondary="You must enter the exact master key used for encryption" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Required: AAD (if used)" secondary="If AAD was used during encryption, you must enter the same value" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Required: Iteration Count (if changed)" secondary="If you changed the PBKDF2 iteration count, you must enter the same value" />
                </ListItem>
              </List>
            </Box>

            {/* Iteration Count Explanation */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Key /> PBKDF2 Iteration Count
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                The iteration count determines how many times your password is processed to make brute-force attacks much harder. Higher values are more secure but may be slower on older devices.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Default:</strong> {passwordManagerConfig.masterKeyDefaultIteraion.toLocaleString()} iterations
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Available options:</strong> {passwordManagerConfig.masterKeyIteraionList.map(n => n.toLocaleString()).join(", ")}
              </Typography>
              <Typography variant="body2" color="warning.main">
                ⚠️ If you changed the iteration count during encryption, you must enter the same value for decryption. If you forget the iteration count, master key, or AAD, you cannot decrypt your data.
              </Typography>
            </Box>

            {/* Decryption Process */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilePresent /> Decryption Process
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText secondary="1. Click 'Upload File' and enter master key (update iteration, if changed while encryption)" />
                </ListItem>
                <ListItem>
                  <ListItemText secondary="2. View and manage existing secrets" />
                </ListItem>
              </List>
            </Box>

            {/* Security Features */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Lock /> Security Features
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Offline Functionality" secondary="Works completely offline - can be used without internet connection, once the page is loaded" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Local Processing" secondary="All decryption happens in your browser, no server communication" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={<Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>Strong Encryption <Link href="/aes-gcm" target="_blank" rel="noopener noreferrer" sx={{ fontSize: "0.8rem", color: "primary.main" }}>(Learn more about AES-GCM)</Link></Box>} secondary="AES-GCM encryption, PBKDF2 key derivation, SHA-256 for integrity" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Data Protection" secondary="Automatic memory cleanup, session-only storage, integrity verification" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Additional Authenticated Data (AAD) - Optional" secondary="Extra layer of security that binds encrypted data to its context (optional feature)" />
                </ListItem>
                <ListItem sx={{ pl: 4 }}>
                  <ListItemText secondary="• When enabled, prevents encrypted data from being used in different contexts" />
                </ListItem>
                <ListItem sx={{ pl: 4 }}>
                  <ListItemText secondary="• Provides additional integrity and authenticity verification" />
                </ListItem>
                <ListItem sx={{ pl: 4 }}>
                  <ListItemText secondary="• Optional but recommended for enhanced security" />
                </ListItem>
              </List>
            </Box>

            {/* Technical Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Description /> Technical Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Cryptographic Operations" secondary="Two-level key derivation with PBKDF2, AES-GCM for authenticated encryption" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Integrity Verification" secondary="HMAC-SHA256 for file integrity, prevents unauthorized modifications" />
                </ListItem>
              </List>
            </Box>

            {/* Password Best Practices */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Key /> Password Best Practices
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                A strong password follows ALL THREE of these tips:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="1. Make them long" secondary={<Typography variant="body2" component="div">At least 16 characters—longer is stronger!</Typography>} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="2. Make them random" secondary={<Box component="div"><Typography variant="body2">Two ways to do this:</Typography><Typography variant="body2" sx={{ pl: 2 }}>a) Use a random string of mixed-case letters, numbers and symbols:</Typography><Typography variant="body2" sx={{ pl: 3, color: "success.main" }}>• cXmnZK65rf*&DaaD<br />• Yuc8$RikA34%ZoPPao98t</Typography><Typography variant="body2" sx={{ pl: 2, mt: 1 }}>b) Create a memorable phrase of 4-7 unrelated words (passphrase):</Typography><Typography variant="body2" sx={{ pl: 3 }}>Good: <span style={{ color: "#2e7d32" }}>HorsePurpleHatRun</span><br />Great: <span style={{ color: "#2e7d32" }}>HorsePurpleHatRunBay</span><br />Amazing: <span style={{ color: "#2e7d32" }}>Horse Purple Hat Run Bay Lifting</span></Typography><Typography variant="body2" sx={{ pl: 2, fontStyle: "italic" }}>Note: You can use spaces before or between words if you prefer!</Typography></Box>} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="3. Make them unique" secondary={<Box component="div"><Typography variant="body2">Use a different strong password for each account. For example:</Typography><Typography variant="body2" sx={{ pl: 2, color: "success.main" }}>Bank: k8dfh8c@Pfv0gB2<br />Email: legal tiny facility freehand probable enamel<br />Social media: e246gs%mFs#3tv6</Typography></Box>} />
                </ListItem>
              </List>
            </Box>

            {/* Quick Start */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PlayArrow /> Quick Start
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Initial Setup:
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }} gutterBottom>
                Upload File → Enter Master Key (+AAD/iteration if used) → View Secrets
              </Typography>
            </Box>

            {/* Security Warnings */}
            <Box sx={{ backgroundColor: "warning.lighter", p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                Important Security Warnings:
              </Typography>
              <List dense sx={{ pl: 1 }}>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Master Key:</strong> If you forget or lose your master key, there is NO WAY to recover your encrypted data. Keep your master key in a secure location!
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>AAD (Additional Authenticated Data):</strong> If you enable AAD, you must remember both the master key AND the AAD value. Without either, your data cannot be decrypted.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Iteration Count:</strong> If you changed the PBKDF2 iteration count, you must remember it for decryption. Forgetting it means you cannot decrypt your data.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Data Security:</strong> The encryption includes additional safeguards to protect against tampering and unauthorized modifications.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="warning.dark">
                    • <strong>Offline Usage:</strong> You can use Rahasya offline - save it to your device for secure access without internet connectivity.
                  </Typography>
                </ListItem>
              </List>
              <Typography variant="body2" color="error.dark" sx={{ mt: 1, fontWeight: "bold", p: 1, bgcolor: "error.lighter", borderRadius: 1 }}>
                ⚠️ NO RECOVERY OPTIONS: There is no way to recover encrypted data if you lose your master key, AAD, or iteration count (if changed). Make sure to keep them secure!
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

HowItWorksDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

export default HowItWorksDialog;