import '../../styles/Navigation/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Terra Numerica. Tous droits réservés.</p>
    </footer>
  );
};

export default Footer; 