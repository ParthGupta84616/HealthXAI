"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import React from "react";
import SmartDeviceCard from "@/components/SmartDeviceCard";


export default function CameraView() {
  return (
    <div className=" flex items-center justify-center bg-white ">
    <SmartDeviceCard 
      deviceName="Health Monitor"
      deviceType="Fitness Tracker"
      workoutCompletion="75%"
      routineCompletion="80%"
      height={175}
      weight={70}
      age="teenager"
      gender="male"
    />
  </div>
  )
}
