import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Card4 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardStyle =
    "bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300";

  const bottomCardMinHeight = "min-h-[200px]"; // Reduced height

  return (
    <>
      <div
        className={`${cardStyle} ${bottomCardMinHeight} flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-purple-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800">
              Pricing
            </h2>
          </div>
          <p className="text-gray-600 mb-2">
            Upgrade to our premium plan.
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Pricing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Choose Your Plan</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Basic Plan */}
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="text-lg font-medium text-gray-800 mb-2">Basic</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$9<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Health tracking
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      5 consultations/month
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Basic reports
                    </li>
                  </ul>
                  <button className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition">
                    Select
                  </button>
                </div>

                {/* Premium Plan */}
                <div className="border-2 border-purple-500 rounded-xl p-5 shadow-md relative">
                  <div className="absolute -top-3 right-5 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    POPULAR
                  </div>
                  <div className="text-lg font-medium text-gray-800 mb-2">Premium</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$19<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Everything in Basic
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Unlimited consultations
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Detailed health insights
                    </li>
                  </ul>
                  <button className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                    Select
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="text-lg font-medium text-gray-800 mb-2">Enterprise</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$49<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Everything in Premium
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Family account (5 users)
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Priority support
                    </li>
                  </ul>
                  <button className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition">
                    Select
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Card4;