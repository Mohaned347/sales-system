"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <motion.div variants={itemVariants}>
          <Card className="w-full shadow-lg border-0 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  أهلاً بعودتك
                </CardTitle>
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardDescription className="text-gray-600">
                  أدخل بياناتك للوصول إلى حسابك
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent>
              <motion.div variants={itemVariants}>
                <LoginForm />
              </motion.div>
              
            </CardContent>
          </Card>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-indigo-200/30 blur-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 4 }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-purple-200/30 blur-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.3 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 5, delay: 1 }}
        />
      </motion.div>
    </div>
  );
}