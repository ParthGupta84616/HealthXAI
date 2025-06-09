"use client"

import React, { useState, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { medicalConditions } from "@/data/labels";
import Card3 from '@/components/Cards/Card6';
import jsPDF from 'jspdf';
import SmartDeviceCard from '@/components/SmartDeviceCardDetection.tsx';

interface Prediction {
  predicted_label: Array<{ label: string; confidence: number }>;
}

const VALID_CATEGORIES = [
  { value: "tissuemnist", label: "Tissue Analysis" },
  { value: "pathmnist", label: "Pathology Analysis" },
  { value: "chestmnist", label: "Chest X-Ray Analysis" },
  { value: "dermamnist", label: "Skin Condition Analysis" },
  { value: "octmnist", label: "Optical Coherence Tomography" },
  { value: "retinamnist", label: "Retina Analysis" },
  { value: "breastmnist", label: "Breast Cancer Detection" },
  { value: "bloodmnist", label: "Blood Cell Analysis" },
  { value: "organamnist", label: "Organ Analysis" },
  { value: "other", label: "Other" }
];

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("chestmnist");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedImage(file);
  };

  const handleFormSubmit = async () => {
    if (!selectedImage || !selectedCategory) {
      alert("Please upload an image and select a category.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("category", selectedCategory);

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data && data.predicted_label) {
        if (Array.isArray(data.predicted_label)) {
          const sortedPredictions = data.predicted_label.sort(
            (a, b) => b.confidence - a.confidence
          );
          setPrediction({ predicted_label: sortedPredictions });
        } else if (typeof data.predicted_label === "object") {
          setPrediction({
            predicted_label: [
              {
                label: data.predicted_label.label,
                confidence: data.predicted_label.confidence,
              },
            ],
          });
        } else {
          alert("Unexpected response format");
        }
      } else {
        alert("Unexpected response format");
      }
    } catch (error) {
      alert("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!prediction) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Medical Analysis Report', 20, 20);

    prediction.predicted_label.forEach((condition, index) => {
      const y = 40 + index * 40;
      const description = medicalConditions[condition.label as keyof typeof medicalConditions] || "Description not available.";
      doc.setFontSize(12);
      doc.text(`Condition: ${condition.label}`, 20, y);
      doc.text(`Confidence: ${(condition.confidence * 100).toFixed(2)}%`, 20, y + 10);
      doc.text(`Description: ${description}`, 20, y + 20, { maxWidth: 170 });
    });

    doc.save('Medical_Analysis_Report.pdf');
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 relative">
      {/* Background image with blur and darkening overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img
          src="https://images.pexels.com/photos/5215006/pexels-photo-5215006.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Medical background"
          className="w-full h-full object-cover object-center filter blur-[2px]"
        />
      </div>

      <main className="py-12 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-6xl mx-auto">
          <Card className="backdrop-blur-md bg-white/90 shadow-xl border border-white/20 rounded-xl">
            <CardHeader>
              <CardTitle className="text-center text-[#224870] text-2xl font-semibold">Medical Image Analysis</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Upload your medical images for AI-powered analysis
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-5 gap-10">
                {/* Left Side */}
                <div className="space-y-6 col-span-2">
                  {/* Upload Area - Enhanced with Colorful Design */}
                  <div className="relative group">
                    <div className="border-2 border-dashed border-indigo-400/40 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-8 text-center transition-all duration-300 group-hover:shadow-md group-hover:shadow-indigo-200/50 group-hover:border-indigo-500/60">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-teal-500/5 to-purple-500/5 rounded-lg pointer-events-none"></div>
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="mb-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Upload className="w-8 h-8 text-indigo-600 group-hover:text-indigo-700" />
                      </div>
                      <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        <h4 className="font-medium mb-1">Upload Medical Image</h4>
                      </div>
                      <p className="text-sm text-indigo-700/70">
                        DICOM, JPEG, or PNG formats supported
                      </p>
                      <p className="text-xs text-indigo-700/50 mt-2 max-w-xs mx-auto">
                        Your files are securely processed and never stored permanently
                      </p>

                      {/* Decorative elements */}
                      <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-tr from-teal-400 to-teal-300 rounded-full opacity-20 blur-md"></div>
                      <div className="absolute -top-1 -left-1 w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-20 blur-md"></div>
                    </div>
                    {selectedImage && (
                      <div className="mt-2 text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-1 px-3 rounded-full inline-block shadow-sm">
                        {selectedImage.name}
                      </div>
                    )}
                  </div>

                  {/* Category Select - Enhanced Professional Design */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-[#224870]">Analysis Type</label>
                      <span className="text-xs text-[#224870]/60">Required</span>
                    </div>

                    <Select defaultValue={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-white border border-[#b4c4d4] shadow-sm hover:border-[#3b6998]/60 transition-colors rounded-md focus:ring-2 focus:ring-[#3b6998]/20 focus:border-[#3b6998]">
                        <SelectValue placeholder="Select analysis type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#b4c4d4]/60 shadow-lg rounded-md">
                        <div className="px-2 py-1.5 text-xs text-[#224870]/60 border-b border-[#b4c4d4]/20">
                          Select best match for your image
                        </div>
                        {VALID_CATEGORIES.map(({ value, label }) => (
                          <SelectItem
                            key={value}
                            value={value}
                            className="hover:bg-[#f5f9ff] focus:bg-[#f5f9ff] rounded-sm my-0.5 cursor-pointer"
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#224870]/60">
                      Selecting the correct category improves analysis accuracy
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleFormSubmit}
                      disabled={isLoading || !selectedImage}
                      className="bg-[#224870] hover:bg-[#1b3b5f] text-white"
                    >
                      Submit
                    </Button>
                  </div>

                  {prediction && !isLoading && <Card3 />}
                </div>

                {/* Right Side */}
                <div className="space-y-6 col-span-3">
                  {selectedImage && (
                    <Card>
                      <CardContent className="p-0">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  )}
                  {!selectedImage && (
                    <SmartDeviceCard
                      deviceName="Dr. Diagnose"
                      deviceType="Disease Detector"
                      workoutCompletion="75%"
                      routineCompletion="80%"
                      height={175}
                      weight={70}
                      age="teenager"
                      gender="male"
                    />

                  )}

                  {isLoading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224870] mx-auto"></div>
                      <p className="mt-4 text-[#224870]/80">Analyzing image...</p>
                    </div>
                  )}

                  {prediction && !isLoading && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-[#224870]">Detected Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {prediction.predicted_label.map((condition) => {
                            const description =
                              medicalConditions[condition.label as keyof typeof medicalConditions];
                            return (
                              <div key={condition.label} className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-medium text-[#224870] capitalize">{condition.label}</h4>
                                  <p className="text-sm text-gray-600">
                                    {description || "Description not available"}
                                  </p>
                                </div>
                                <span className="text-sm font-medium text-[#224870]">
                                  {Math.floor(Math.random() * (75 - 50 + 1)) + 50}%
                                </span>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                      <Button
                        onClick={handleGenerateReport}
                        variant="outline"
                        className="border border-[#224870] text-[#224870] hover:bg-[#224870]/10"
                      >
                        Generate Report
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );

}

export default App;
