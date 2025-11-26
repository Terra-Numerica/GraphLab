// ❌ plus besoin : import '../../styles/Navigation/Footer.css';

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-darkBlue navbar-gradient text-white text-sm sm:text-base">
      <div className="mx-auto max-w-screen-xl px-4 py-6 text-center text-sm text-white sm:px-6 md:px-8">
        © {new Date().getFullYear()} Terra Numerica. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;