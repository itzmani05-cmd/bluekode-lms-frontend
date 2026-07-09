const Footer = () => {
  return (
    <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/20 bg-white/20">
      &copy; {new Date().getFullYear()} Bluekode. All rights reserved.
    </footer>
  );
};

export default Footer;