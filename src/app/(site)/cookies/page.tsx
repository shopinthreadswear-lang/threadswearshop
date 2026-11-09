import { PolicyPage } from "@/components/content/PolicyPage";
import { CookieSettingsLink } from "@/components/common/CookieBanner";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Cookie Policy", description: "How Threads Ware uses cookies and similar technologies, and how to manage your preferences.", path: "/cookies" });

export default function CookiesPage() {
  return (
    <PolicyPage
      crumb="Cookie Policy"
      eyebrow="Legal"
      title="Cookie Policy"
      intro={<>Cookies are small files stored on your device. We use them to keep the site secure and working, and — only with your consent — to understand and improve your experience.</>}
      updated="1 October 2026"
      aside={<CookieSettingsLink className="btn btn-outline btn-sm" />}
      sections={[
        {
          id: "types",
          title: "Cookies we use",
          body: (
            <table>
              <thead><tr><th>Category</th><th>Purpose</th><th>Examples</th></tr></thead>
              <tbody>
                <tr><td>Strictly necessary</td><td>Sign-in, security, bag and checkout</td><td>tw_session, local bag storage</td></tr>
                <tr><td>Analytics</td><td>Understand how the site is used</td><td>Google Analytics 4</td></tr>
                <tr><td>Personalisation</td><td>Remember preferences and recently viewed</td><td>Grid layout, recent searches</td></tr>
                <tr><td>Marketing</td><td>Measure campaigns and show relevant ads</td><td>Meta Pixel</td></tr>
              </tbody>
            </table>
          ),
        },
        { id: "consent", title: "Your choices", body: <><p>Non-essential cookies are only set after you choose “Accept All” or enable them in Manage Preferences. You can change your choice at any time using the Cookie Settings link in the footer.</p><p><CookieSettingsLink className="link-static" /></p></> },
        { id: "browser", title: "Browser controls", body: <p>You can also block or delete cookies in your browser settings. Blocking strictly necessary cookies may stop the bag and checkout from working.</p> },
      ]}
    />
  );
}
