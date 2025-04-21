import React from "react";
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
    Link
} from "@mui/material";
import {
    Key,
    Lock,
    Security,
    CheckCircleOutline,
    FilePresent,
    Visibility,
    PlayArrow
} from "@mui/icons-material";
import passwordManagerConfig from "../config/PasswordManagerConfig";

const HowDecryptorWorksDialog = ({ open, onClose }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ 
                backgroundColor: "primary.main", 
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 1
            }}>
                <Security /> How Rahasya Decryption Works
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ p: 2 }}>
                    {/* Overview */}
                    <Typography variant="h6" gutterBottom>
                        Overview
                    </Typography>
                    <Typography>
                        Rahasya(Sanskrit: रहस्य, means secret, mystery, or something hidden) Decryptor allows you to securely access your encrypted secrets. 
                        It requires the same master key that was used for encryption, and if AAD was used, 
                        you&apos;ll need that value as well.
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    {/* File Requirements */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilePresent /> File Requirements
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="File Integrity" 
                                    secondary="File must not be modified after encryption"
                                />
                            </ListItem>
                        </List>
                    </Box>

                    {/* Master Key Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Key /> Master Key Requirements
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Original Master Key Required" 
                                    secondary="Must use the same master key that was used for encryption"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Key Length" 
                                    secondary={`${passwordManagerConfig.masterKeyMinLength}-${passwordManagerConfig.masterKeyMaxLength} characters, exactly as used during encryption`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Session Security" 
                                    secondary="Key is only held in memory during the active session"
                                />
                            </ListItem>
                        </List>
                    </Box>

                    {/* Decryption Process */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FilePresent /> Decryption Process
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Upload Encrypted File" 
                                    secondary="Select the file you want to decrypt"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Enter Master Key" 
                                    secondary="Provide the master key used during encryption"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="View Secrets" 
                                    secondary="Click on individual secrets to decrypt and view them"
                                />
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
                                <ListItemText 
                                    primary="Individual Secret Decryption" 
                                    secondary="Each secret is decrypted separately for enhanced security"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Integrity Verification" 
                                    secondary="File integrity is verified before decryption"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            Authenticated Decryption
                                            <Link 
                                                href="https://www.youtube.com/watch?v=-fpVv_T4xwA&t=29s"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ fontSize: "0.8rem", color: "primary.main" }}
                                            >
                                                (Learn more about AES-GCM)
                                            </Link>
                                        </Box>
                                    }
                                    secondary="Uses AES-GCM for authenticated decryption"
                                />
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
                                <ListItemText 
                                    primary="1. Make them long" 
                                    secondary={
                                        <Typography variant="body2" component="div">
                                            At least 16 characters—longer is stronger!
                                        </Typography>
                                    }
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="2. Make them random"
                                    secondary={
                                        <Box component="div">
                                            <Typography variant="body2">
                                                Two ways to do this:
                                            </Typography>
                                            <Typography variant="body2" sx={{ pl: 2 }}>
                                                a) Use a random string of mixed-case letters, numbers and symbols:
                                            </Typography>
                                            <Typography variant="body2" sx={{ pl: 3, color: 'success.main' }}>
                                                • cXmnZK65rf*&DaaD<br/>
                                                • Yuc8$RikA34%ZoPPao98t
                                            </Typography>
                                            <Typography variant="body2" sx={{ pl: 2, mt: 1 }}>
                                                b) Create a memorable phrase of 4-7 unrelated words (passphrase):
                                            </Typography>
                                            <Typography variant="body2" sx={{ pl: 3 }}>
                                                Good: <span style={{ color: '#2e7d32' }}>HorsePurpleHatRun</span><br/>
                                                Great: <span style={{ color: '#2e7d32' }}>HorsePurpleHatRunBay</span><br/>
                                                Amazing: <span style={{ color: '#2e7d32' }}>Horse Purple Hat Run Bay Lifting</span>
                                            </Typography>
                                            <Typography variant="body2" sx={{ pl: 2, fontStyle: 'italic' }}>
                                                Note: You can use spaces before or between words if you prefer!
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="3. Make them unique"
                                    secondary={
                                        <Box component="div">
                                            <Typography variant="body2">
                                                Use a different strong password for each account. For example:
                                            </Typography>
                                            <Typography variant="body2" sx={{ pl: 2, color: 'success.main' }}>
                                                Bank: k8dfh8c@Pfv0gB2<br/>
                                                Email: legal tiny facility freehand probable enamel<br/>
                                                Social media: e246gs%mFs#3tv6
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        </List>
                    </Box>

                    {/* Viewing Secrets */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Visibility /> Viewing Secrets
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    secondary="1. Click the decrypt button next to any secret"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="2. View the decrypted username, password, and notes"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="3. Copy values to clipboard as needed"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="4. Secret is automatically hidden when dialog is closed"
                                />
                            </ListItem>
                        </List>
                    </Box>

                    {/* Workflow */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PlayArrow /> Workflow
                        </Typography>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Basic Decryption Flow:
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    secondary="1. Add your master key"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="2. Upload the .rahasya file"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="3. Click decrypt button next to each secret you want to view"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="4. Copy needed information"
                                />
                            </ListItem>
                        </List>

                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                            When Using AAD:
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    secondary="1. Add master key"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="2. Upload encrypted file"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="3. Provide AAD value when decrypting secrets"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="4. View decrypted information"
                                />
                            </ListItem>
                        </List>

                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                            Common Use Cases:
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    secondary="• Accessing stored passwords"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="• Retrieving secure notes"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    secondary="• Viewing encrypted credentials"
                                />
                            </ListItem>
                        </List>
                    </Box>

                    {/* Important Warning */}
                    <Box sx={{ 
                        backgroundColor: "warning.lighter",
                        p: 2,
                        borderRadius: 1
                    }}>
                        <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                            Important Security Notes:
                        </Typography>
                        <List dense sx={{ pl: 1 }}>
                            <ListItem>
                                <Typography variant="body2" color="warning.dark">
                                    • <strong>Master Key Match:</strong> The master key must exactly match 
                                    the one used during encryption. There is no way to recover data if you 
                                    use a different key.
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography variant="body2" color="warning.dark">
                                    • <strong>AAD Requirement:</strong> If AAD was used during encryption, 
                                    you must provide the same AAD value for decryption.
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography variant="body2" color="warning.dark">
                                    • <strong>Offline Security:</strong> All decryption happens locally 
                                    in your browser - no data is sent to any server.
                                </Typography>
                            </ListItem>
                        </List>
                        <Typography 
                            variant="body2" 
                            color="error.dark" 
                            sx={{ 
                                mt: 1, 
                                fontWeight: "bold",
                                p: 1,
                                bgcolor: "error.lighter",
                                borderRadius: 1
                            }}
                        >
                            ⚠️ NO RECOVERY OPTIONS: If you&apos;ve forgotten your master key or AAD value, 
                            there is absolutely no way to recover your encrypted data!
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

HowDecryptorWorksDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default HowDecryptorWorksDialog;