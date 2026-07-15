import logo from '../../assests/logo.jpeg';

const Footer = () => {
  return (
    <footer className="w-full py-4 border-t border-slate-200/20 bg-white/20">
      <div className="flex flex-col items-center gap-1.5">
        <img src={logo} alt="Bluekode LMS" className="h-6 w-auto opacity-60" />
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Bluekode. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
