export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span>✅</span>
          <span className="footer-brand-name">TaskFlow</span>
        </div>
        <p className="footer-copy">© {year} TaskFlow. Built with the MERN Stack.</p>
        <div className="footer-links">
          <span>React</span>
          <span className="footer-dot">·</span>
          <span>Node.js</span>
          <span className="footer-dot">·</span>
          <span>MongoDB</span>
        </div>
      </div>
    </footer>
  );
}
