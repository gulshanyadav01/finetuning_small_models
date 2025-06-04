import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Upload, Settings, Sliders, Activity, TerminalSquare, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Layers, label: 'Select Model', path: '/select-model' },
  { icon: Upload, label: 'Upload Data', path: '/upload-data' },
  { icon: Sliders, label: 'Configure', path: '/configure' },
  { icon: Activity, label: 'Training Progress', path: '/progress' },
  { icon: TerminalSquare, label: 'Query Models', path: '/query' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function SideNav() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      
      <AnimatePresence>
        {(isOpen || true) && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
              "w-64 md:w-72 shrink-0 overflow-y-auto",
              "fixed md:sticky top-0 bottom-0 left-0 z-10 md:z-0",
              isOpen ? "block" : "hidden md:block",
              "md:h-screen"
            )}
          >
            <div className="p-6">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">LaaP Studio</h1>
              </div>
              
              <nav className="mt-8 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-md"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}