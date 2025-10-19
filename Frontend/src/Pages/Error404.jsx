import React from 'react';
import { Link } from "react-router-dom";
import { Ghost, HomeIcon } from "lucide-react";
import { motion } from "framer-motion";

const Error404Page = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-md text-center">
        <motion.div 
          className="mx-auto text-primary"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Ghost size={64} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            404
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Page Not Found
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Oops! Looks like this page has wandered off into the digital void.
          </p>
        </motion.div>

        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <HomeIcon size={20} />
            Return Home
          </Link>
        </motion.div>

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Error404Page;