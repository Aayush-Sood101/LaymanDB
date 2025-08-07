// src/components/PageTemplate.js
import { NavbarComponent } from './Navbar'; // Adjust path if needed

export default function PageTemplate({ children }) {
  return (
    <div>
      <NavbarComponent />
      {/* This 'main' tag wraps your page content.
        The 'pt-24' (padding-top: 6rem) pushes the content down,
        creating space for the fixed navbar above it.
      */}
      <main className="pt-24"> 
        {children}
      </main>
    </div>
  );
}