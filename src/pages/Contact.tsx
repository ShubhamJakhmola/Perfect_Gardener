import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send, Leaf, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";

const EMAILJS_CONFIG = {
  serviceId: 'service_m7co0uu',
  templateId: 'template_1x3zj8n',
  publicKey: 'rWeo1dt9mNcXiXJfV'
};

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    math: "",
    website: "", // Honeypot field
  });

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }, []);

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear alert when user starts typing
    if (alert) setAlert(null);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    // Check honeypot
    if (formData.website) {
      setAlert({ type: 'error', message: 'Spam detected. Please try again.' });
      return false;
    }

    // Check math question
    if (formData.math !== '8') {
      setAlert({ type: 'error', message: 'Please answer the math question correctly.' });
      return false;
    }

    // Check required fields
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Please enter your name.' });
      return false;
    }

    if (!formData.email.trim()) {
      setAlert({ type: 'error', message: 'Please enter your email address.' });
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setAlert({ type: 'error', message: 'Please enter a valid email address.' });
      return false;
    }

    if (!formData.subject.trim()) {
      setAlert({ type: 'error', message: 'Please enter a subject.' });
      return false;
    }

    if (!formData.message.trim()) {
      setAlert({ type: 'error', message: 'Please enter your message.' });
      return false;
    }

    if (formData.message.trim().length < 10) {
      setAlert({ type: 'error', message: 'Please enter a more detailed message (at least 10 characters).' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare EmailJS template parameters
      const templateParams = {
        from_name: formData.name.trim(),
        from_email: formData.email.trim(),
        subject: formData.subject.trim() || 'Contact Form - Perfect Gardener',
        message: formData.message.trim(),
      };

      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      // Success
      setAlert({ type: 'success', message: "Message sent successfully! I'll get back to you soon." });
      toast({
        title: "Message Sent! 🌱",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({ name: "", email: "", subject: "", message: "", math: "", website: "" });
    } catch (error: any) {
      console.error('EmailJS Error:', error);
      const errorMessage = error.text || error.message || 'Please try again later or contact us directly.';
      setAlert({ type: 'error', message: `Sorry, there was an error sending your message. ${errorMessage}` });
      toast({
        title: "Failed to send message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "progardener01@gmail.com",
      description: "We reply within 24 hours",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+91 998859975",
      
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Uttarakhand, India",
      description: "India",
    },
    {
      icon: Clock,
      title: "Working Hours",
      value: "9:00 AM - 6:00 PM",
      description: "Monday to Saturday",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Get in Touch</span>
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3 xs:mb-4">
              Contact Us
            </h1>
            <p className="text-sm xs:text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Got questions about gardening? Need some tips? Drop us a line and we'll get back to you!
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-display">Send us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6" id="contact-form">
                      {/* Alert Message */}
                      {alert && (
                        <Alert 
                          variant={alert.type === 'error' ? 'destructive' : 'default'} 
                          className={alert.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}
                        >
                          {alert.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <AlertDescription className={alert.type === 'success' ? 'text-green-800 dark:text-green-200' : ''}>
                            {alert.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-background"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-background"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="What's this about?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="bg-background"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Your Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="bg-background resize-none"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Math Question */}
                      <div className="space-y-2">
                        <Label htmlFor="math">Security Question: What is 5 + 3? *</Label>
                        <Input
                          id="math"
                          name="math"
                          type="text"
                          placeholder="Enter your answer"
                          value={formData.math}
                          onChange={handleChange}
                          required
                          className="bg-background"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Honeypot Field - Hidden from users */}
                      <div className="hidden" style={{ display: 'none' }}>
                        <Label htmlFor="website">Website (leave blank)</Label>
                        <Input
                          id="website"
                          name="website"
                          type="text"
                          value={formData.website}
                          onChange={handleChange}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                        <info.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{info.title}</h3>
                        <p className="text-foreground/90">{info.value}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Quick Tips Card */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-primary" />
                      Quick Gardening Tip
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Water your plants early in the morning to reduce evaporation and give leaves time to dry before nightfall, preventing fungal diseases.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
