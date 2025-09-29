import Footer from "../ui/layout/Footer";

export default function WebsiteFooter() {
  return (
    <Footer>
      <span>{' · '}</span>
      <a href='/privacy'>Privacy Policy</a>
      <span>{' · '}</span>
      <a href='/terms'>Terms of Use</a>
    </Footer>
  );
}
