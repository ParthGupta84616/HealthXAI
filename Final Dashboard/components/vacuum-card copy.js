"use client"

import Link from "next/link"
import Image from "next/image"
import { Brain, Shield, BarChart2, Share2 } from "lucide-react"

export default function MedicalImageCard() {
  return (
    <Link href="/medical-imaging" className="block">
      <div className="relative bg-[#E6EEF9] rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full hover:shadow-md transition-shadow">
        <Image
          src="https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg"
          alt="Medical background"
          className="absolute inset-0 w-full h-full object-cover"
          width={400}
          height={300}
          priority
        />
        <div className="relative p-5 backdrop-blur-md bg-white/70 h-full">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-lg text-gray-900">MedViT: Robust Medical Imaging</h3>
              <p className="text-gray-500 text-sm">Hybrid Vision Transformer + CNN</p>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">New</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Model Type</p>
                <p className="text-sm font-medium">CNN + Transformer</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">ImageNet Accuracy</p>
                <p className="text-sm font-medium">83.96%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Robustness</p>
                <p className="text-sm font-medium">Adversarial Safe</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Generalization</p>
                <p className="text-sm font-medium">Across Datasets</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
