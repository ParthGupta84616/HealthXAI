
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative">
      {/* Floating orbs for visual interest */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-yoga-purple/20 blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-yoga-blue/20 blur-3xl animate-pulse-slow"></div>
      
      <div className="z-10 w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="glass px-6 py-4 mb-12 rounded-full inline-flex items-center">
          <Star className="w-5 h-5 mr-2 text-yoga-purple" />
          <span className="text-white/80 font-medium">Elevate your practice with pose detection</span>
        </div>
        
        {/* Main Content */}
        <div className="glass rounded-3xl p-10 md:p-16 flex flex-col items-center text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-yoga-purple to-yoga-blue"></div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient leading-tight">
            Yoga Pose Detection
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-light mb-6 text-white/90">
            Transform Your Yoga Practice with AI
          </h2>
          
          <p className="text-lg mb-10 text-white/70 max-w-2xl">
            Achieve perfect poses with real-time feedback and guidance. Our advanced AI analyzes your movements to help you perfect your form and deepen your practice.
          </p>
          
          <Link to="/start" className="w-full md:w-auto">
            <Button className="bg-gradient-to-r from-yoga-purple to-yoga-blue hover:opacity-90 text-white px-10 py-6 rounded-xl text-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-yoga-purple/20">
              Let's Begin
            </Button>
          </Link>
          
          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
            <div className="glass p-6 rounded-xl text-left">
              <div className="w-10 h-10 mb-4 rounded-full bg-yoga-purple/20 flex items-center justify-center">
                <span className="text-yoga-purple font-bold">01</span>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">Real-time Analysis</h3>
              <p className="text-white/70 text-sm">Get instant feedback on your form as you practice</p>
            </div>
            
            <div className="glass p-6 rounded-xl text-left">
              <div className="w-10 h-10 mb-4 rounded-full bg-yoga-blue/20 flex items-center justify-center">
                <span className="text-yoga-blue font-bold">02</span>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">Guided Corrections</h3>
              <p className="text-white/70 text-sm">Receive personalized adjustments to improve your poses</p>
            </div>
            
            <div className="glass p-6 rounded-xl text-left">
              <div className="w-10 h-10 mb-4 rounded-full bg-yoga-purple/20 flex items-center justify-center">
                <span className="text-yoga-purple font-bold">03</span>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">Progress Tracking</h3>
              <p className="text-white/70 text-sm">Monitor your improvement over time with detailed insights</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-white/50 text-sm text-center">
          Experience the perfect blend of ancient practice and modern technology
        </div>
      </div>
    </div>
  );
};

export default Index;
