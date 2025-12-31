import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 pt-20 pb-16">
        <section className="py-12 md:py-16">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-8">
                Privacy Policy
              </h1>

              <div className="space-y-6 text-foreground text-lg leading-relaxed">
                <p><strong>Welcome to Perfect Gardener.</strong></p>
                <p>Your privacy matters to us. This page explains what data we collect, how it's used, and how it's protected.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">1. Information We Collect</h2>
                <p>Perfect Gardener is a static website and does not collect personal information by default.</p>
                <p>We may collect limited information in the following cases:</p>
                
                <h3 className="text-xl font-display font-semibold text-foreground mt-6 mb-3">a) Analytics Data</h3>
                <p>We use Google Analytics to understand how visitors interact with our website. This may include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Pages visited</li>
                  <li>Time spent on pages</li>
                  <li>Device type and browser</li>
                  <li>Approximate location (city-level)</li>
                </ul>
                <p>This data is anonymous and does not personally identify you.</p>
                
                <h3 className="text-xl font-display font-semibold text-foreground mt-6 mb-3">b) Contact Information</h3>
                <p>If you contact us through the contact form or email:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Your name and email address may be collected</li>
                  <li>This data is used only to reply to your message</li>
                  <li>We do not store, sell, or share this information for marketing purposes.</li>
                </ul>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">2. Cookies</h2>
                <p>Perfect Gardener may use cookies via Google Analytics to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Measure website traffic</li>
                  <li>Improve performance and content quality</li>
                </ul>
                <p>You can disable cookies anytime through your browser settings.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">3. Affiliate Disclosure</h2>
                <div className="border border-border rounded-lg p-4 bg-muted/50 my-4">
                  <strong>Affiliate Disclosure</strong>
                  <p className="mt-2">
                    Some links on this website are affiliate links. This means we may earn a small commission if you make a purchase through these links, at no extra cost to you. These commissions help support and maintain <strong>Perfect Gardener</strong>.
                  </p>
                </div>
                <p>Affiliate links do not influence our content or recommendations.</p>
                <p>We only share products we genuinely believe may be useful.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">4. Third-Party Services</h2>
                <p>We may use trusted third-party services, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Google Analytics (website analytics)</li>
                  <li>EmailJS (contact form handling)</li>
                </ul>
                <p>These services operate under their own privacy policies.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">5. Data Security</h2>
                <p>We take reasonable steps to protect your data.</p>
                <p>Since Perfect Gardener is a static website, no sensitive user data is stored on our servers.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">6. External Links</h2>
                <p>This website may contain links to external websites (such as product pages or social platforms).</p>
                <p>We are not responsible for the privacy practices of those external sites.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">7. Children's Information</h2>
                <p>Perfect Gardener does not knowingly collect personal information from children under the age of 13.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">8. Changes to This Privacy Policy</h2>
                <p>This Privacy Policy may be updated from time to time.</p>
                <p>Any changes will be posted on this page with an updated revision date.</p>
                
                <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">9. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, you can contact us at:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Email:</strong> progardener01@gmail.com</li>
                  <li><strong>Website:</strong> https://perfectgardener.netlify.app</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Privacy;

