import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Shield, UserPlus, KeyRound, Mail, ArrowLeft } from "lucide-react";
import { usersAPI } from "@/lib/api-client";
import emailjs from "@emailjs/browser";

const EMAILJS_CONFIG = {
  serviceId: 'service_m7co0uu',
  templateId: 'template_2mk7f36',
  publicKey: 'rWeo1dt9mNcXiXJfV'
};

/**
 * Admin Login Page
 * Features:
 * - Login with username/password
 * - Create new admin user (with OTP verification)
 * - Forgot password (with OTP verification and reset)
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('login');
  
  // Login state
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Create user state
  const [createUsername, setCreateUsername] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createOTP, setCreateOTP] = useState("");
  const [createStep, setCreateStep] = useState<'form' | 'otp' | 'verify'>('form');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [isSendingForgotOTP, setIsSendingForgotOTP] = useState(false);
  const [isVerifyingForgotOTP, setIsVerifyingForgotOTP] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Initialize EmailJS
  useEffect(() => {
    try {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('EmailJS initialization error:', error);
    }
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await usersAPI.login(username, password);
      
      if (response.success) {
        sessionStorage.setItem("admin_authenticated", "true");
        sessionStorage.setItem("admin_user", JSON.stringify(response.user));
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard!",
        });
        navigate("/admin");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate OTP via API
  const generateOTP = async (email: string, type: 'create' | 'reset', username?: string, password?: string) => {
    try {
      const response = await fetch('/.netlify/functions/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          email,
          type,
          username,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate OTP`);
      }

      const data = await response.json();
      
      if (!data.success || !data.otp) {
        throw new Error(data.error || 'Failed to generate OTP');
      }

      console.log('OTP generated successfully for:', email);
      return data.otp; // For testing - in production, OTP is sent via email only
    } catch (error: any) {
      console.error('Generate OTP Error:', error);
      throw new Error(error.message || 'Failed to generate OTP. Please try again.');
    }
  };

  // Send OTP via EmailJS
  // SECURITY: Always send OTP to admin email, not user's email
  const ADMIN_EMAIL = 'shubhamjakhmola008@gmail.com';
  
  const sendOTPEmail = async (email: string, otp: string, type: 'create' | 'reset') => {
    try {
      // Ensure EmailJS is initialized (re-initialize if needed)
      try {
        emailjs.init(EMAILJS_CONFIG.publicKey);
      } catch (initError) {
        // Already initialized or other error, continue
        console.log('EmailJS init check:', initError);
      }

      // Calculate expiry time (10 minutes from now)
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
      const expiryTimeString = expiryTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // EmailJS template parameters - using exact variable names from template
      // SECURITY: Always send to admin email, not user's email
      // Template uses: {{email}} for recipient, {{passcode}} for OTP, {{time}} for expiry
      const templateParams = {
        email: ADMIN_EMAIL, // Always send to admin email for security
        passcode: otp,
        time: expiryTimeString
      };

      console.log('Sending OTP email with params:', {
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId,
        email: email,
        otpLength: otp.length,
        expiryTime: expiryTimeString
      });

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      // Log success for debugging
      console.log('EmailJS OTP sent successfully:', {
        status: response.status,
        text: response.text
      });
      
      return response;
    } catch (error: any) {
      // Enhanced error logging
      console.error('EmailJS Error Details:', {
        status: error?.status,
        text: error?.text,
        message: error?.message,
        error: error,
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId
      });

      // Extract more detailed error message
      let errorMessage = 'Failed to send OTP email. Please try again.';
      
      if (error?.text) {
        errorMessage = `EmailJS Error: ${error.text}`;
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Add helpful hints based on common errors
      if (error?.status === 400) {
        errorMessage += ' (Invalid template parameters. Please check EmailJS template configuration.)';
      } else if (error?.status === 401) {
        errorMessage += ' (Invalid EmailJS credentials. Please check service ID and public key.)';
      } else if (error?.status === 404) {
        errorMessage += ' (Template or service not found. Please check template ID.)';
      }

      throw new Error(errorMessage);
    }
  };

  // Create User - Step 1: Send OTP
  const handleCreateUserSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createUsername || !createEmail || !createPassword || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (createPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (createPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(createEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOTP(true);

    try {
      // Generate OTP
      const otp = await generateOTP(createEmail, 'create', createUsername, createPassword);
      
      // Send OTP via EmailJS
      await sendOTPEmail(createEmail, otp, 'create');

      setCreateStep('otp');
      toast({
        title: "OTP Sent Successfully",
        description: "OTP has been sent. Please contact the admin to receive the OTP.",
      });
    } catch (error: any) {
      console.error('Create User OTP Error:', error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Failed to send OTP. Please check your email address and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Create User - Step 2: Verify OTP and Create User
  const handleCreateUserVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createOTP) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP sent to your email.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOTP(true);

    try {
      // Verify OTP
      const response = await fetch('/.netlify/functions/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: createEmail,
          otp: createOTP
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired OTP');
      }

      if (data.type !== 'create') {
        throw new Error('OTP type mismatch');
      }

      // Create user via API
      await usersAPI.create(createUsername, createPassword, createEmail);

      toast({
        title: "Account Created",
        description: "Your admin account has been created successfully! You can now login.",
      });

      // Reset form and go to login
      setCreateUsername("");
      setCreateEmail("");
      setCreatePassword("");
      setConfirmPassword("");
      setCreateOTP("");
      setCreateStep('form');
      
      // Switch to login tab
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Forgot Password - Step 1: Send OTP
  const handleForgotPasswordSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(forgotEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingForgotOTP(true);

    try {
      // Generate OTP
      const otp = await generateOTP(forgotEmail, 'reset');
      
      // Send OTP via EmailJS
      await sendOTPEmail(forgotEmail, otp, 'reset');

      setForgotStep('otp');
      toast({
        title: "OTP Sent Successfully",
        description: "OTP has been sent. Please contact the admin to receive the OTP.",
      });
    } catch (error: any) {
      console.error('Forgot Password OTP Error:', error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Failed to send OTP. Please check your email address and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingForgotOTP(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP
  const handleForgotPasswordVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotOTP) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP sent to your email.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingForgotOTP(true);

    try {
      // Verify OTP
      const response = await fetch('/.netlify/functions/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: forgotEmail,
          otp: forgotOTP
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired OTP');
      }

      if (data.type !== 'reset') {
        throw new Error('OTP type mismatch');
      }

      setForgotStep('reset');
      toast({
        title: "OTP Verified",
        description: "Please enter your new password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid or expired OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingForgotOTP(false);
    }
  };

  // Forgot Password - Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      toast({
        title: "Password Required",
        description: "Please enter and confirm your new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      // Reset password via API
      await usersAPI.resetPassword(forgotEmail, newPassword);

      toast({
        title: "Password Reset",
        description: "Your password has been reset successfully! You can now login.",
      });

      // Reset form and go to login
      setForgotEmail("");
      setForgotOTP("");
      setNewPassword("");
      setConfirmNewPassword("");
      setForgotStep('email');
      
      // Switch to login tab
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />
      
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Admin Portal</CardTitle>
          <CardDescription>
            Manage your admin account and access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">
                <Lock className="w-4 h-4 mr-1" />
                Login
              </TabsTrigger>
              <TabsTrigger value="create">
                <UserPlus className="w-4 h-4 mr-1" />
                Create
              </TabsTrigger>
              <TabsTrigger value="forgot">
                <KeyRound className="w-4 h-4 mr-1" />
                Reset
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    autoFocus
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="bg-background"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Logging in..."
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Login
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Create User Tab */}
            <TabsContent value="create" className="space-y-4 mt-4">
              {createStep === 'form' ? (
                <form onSubmit={handleCreateUserSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-username">Username</Label>
                    <Input
                      id="create-username"
                      type="text"
                      value={createUsername}
                      onChange={(e) => setCreateUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSendingOTP}
                  >
                    {isSendingOTP ? (
                      "Sending OTP..."
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCreateUserVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-otp">Enter OTP</Label>
                    <Input
                      id="create-otp"
                      type="text"
                      value={createOTP}
                      onChange={(e) => setCreateOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      required
                      maxLength={6}
                      className="bg-background text-center text-2xl tracking-widest"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      OTP has been sent. Please contact the admin to receive the OTP.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setCreateStep('form');
                        setCreateOTP("");
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      size="lg"
                      disabled={isVerifyingOTP}
                    >
                      {isVerifyingOTP ? (
                        "Verifying..."
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* Forgot Password Tab */}
            <TabsContent value="forgot" className="space-y-4 mt-4">
              {forgotStep === 'email' ? (
                <form onSubmit={handleForgotPasswordSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="bg-background"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the email associated with your admin account
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSendingForgotOTP}
                  >
                    {isSendingForgotOTP ? (
                      "Sending OTP..."
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </form>
              ) : forgotStep === 'otp' ? (
                <form onSubmit={handleForgotPasswordVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-otp">Enter OTP</Label>
                    <Input
                      id="forgot-otp"
                      type="text"
                      value={forgotOTP}
                      onChange={(e) => setForgotOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      required
                      maxLength={6}
                      className="bg-background text-center text-2xl tracking-widest"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      OTP has been sent. Please contact the admin to receive the OTP.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setForgotStep('email');
                        setForgotOTP("");
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      size="lg"
                      disabled={isVerifyingForgotOTP}
                    >
                      {isVerifyingForgotOTP ? (
                        "Verifying..."
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Verify OTP
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="bg-background"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setForgotStep('otp');
                        setNewPassword("");
                        setConfirmNewPassword("");
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      size="lg"
                      disabled={isResettingPassword}
                    >
                      {isResettingPassword ? (
                        "Resetting..."
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
