import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import React, { useRef, useState, useEffect } from "react";
import backend from "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";
import { count } from "../utils/music";
import Instructions from "../components/Instrctions/Instructions";
import "./Yoga.css";
import DropDown from "../components/DropDown/DropDown";
import { poseImages } from "../utils/pose_images";
import { POINTS, keypointConnections } from "../utils/data";
import { drawPoint, drawSegment } from "../utils/helper";
import { Button } from "@/components/ui/button";

// Change skeleton color to be visible on white background
let skeletonColor = "rgb(30,30,30)";
let poseList = [
  "Tree",
  "Chair",
  "Cobra",
  "Warrior",
  "Dog",
  "Shoulderstand",
  "Traingle",
];

let interval;
let trainingInterval;
let samplingInterval;
let confidenceValues = [];
let currentConfidenceValue = 0;
let isCurrentlyTraining = false;
let flag = false;
let nextPoseTimeout = null;

const CLASS_NO = {
  Chair: 0,
  Cobra: 1,
  Dog: 2,
  No_Pose: 3,
  Shoulderstand: 4,
  Traingle: 5,
  Tree: 6,
  Warrior: 7,
};

function Yoga() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const classifierRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [currentPose, setCurrentPose] = useState("Tree");
  const [isStartPose, setIsStartPose] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [score, setScore] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [samples, setSamples] = useState(0);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [predictedIQ, setPredictedIQ] = useState(null);

  // New state variables for transitions
  const [autoProgress, setAutoProgress] = useState(true);
  const [showPoseTransition, setShowPoseTransition] = useState(false);
  const [nextPoseName, setNextPoseName] = useState("");
  const [transitionCountdown, setTransitionCountdown] = useState(3);
  const [showSequenceProgress, setShowSequenceProgress] = useState(false);
  const [completedPoses, setCompletedPoses] = useState([]);
  const [isAutoProgressPending, setIsAutoProgressPending] = useState(false);

  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    if (flag) {
      setPoseTime(timeDiff);
    }
    if ((currentTime - startingTime) / 1000 > bestPerform) {
      setBestPerform(timeDiff);
    }
  }, [currentTime]);

  useEffect(() => {
    setCurrentTime(0);
    setPoseTime(0);
    setBestPerform(0);
  }, [currentPose]);

  useEffect(() => {
    return () => {
      cleanupAllIntervals();
      // Clear any pending auto-progress timeouts
      if (nextPoseTimeout) {
        clearTimeout(nextPoseTimeout);
        nextPoseTimeout = null;
      }
    };
  }, []);

  // Transition countdown effect
  useEffect(() => {
    let transitionTimer;
    if (showPoseTransition && transitionCountdown > 0) {
      transitionTimer = setTimeout(() => {
        setTransitionCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showPoseTransition && transitionCountdown === 0) {
      // When transition countdown reaches 0, update pose and reset
      setCurrentPose(nextPoseName);
      setShowPoseTransition(false);
      setTransitionCountdown(3);

      // Reset training-related states
      setScore(0);
      setSamples(0);
      setPredictedIQ(null);

      // Start the next training after a small delay
      setTimeout(() => {
        startTraining();
      }, 500);
    }

    return () => {
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, [showPoseTransition, transitionCountdown, nextPoseName]);

  function cleanupAllIntervals() {
    if (interval) clearInterval(interval);
    if (trainingInterval) clearInterval(trainingInterval);
    if (samplingInterval) clearInterval(samplingInterval);
  }

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1);
    let right = tf.gather(landmarks, right_bodypart, 1);
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
    return center;
  }

  function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
    let hips_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    let shoulders_center = get_center_point(
      landmarks,
      POINTS.LEFT_SHOULDER,
      POINTS.RIGHT_SHOULDER
    );
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
    let pose_center_new = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center_new = tf.expandDims(pose_center_new, 1);

    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
    let max_dist = tf.max(tf.norm(d, "euclidean", 0));

    let pose_size = tf.maximum(
      tf.mul(torso_size, torso_size_multiplier),
      max_dist
    );
    return pose_size;
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center = tf.expandDims(pose_center, 1);
    pose_center = tf.broadcastTo(pose_center, [1, 17, 2]);
    landmarks = tf.sub(landmarks, pose_center);

    let pose_size = get_pose_size(landmarks);
    landmarks = tf.div(landmarks, pose_size);
    return landmarks;
  }

  function landmarks_to_embedding(landmarks) {
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0));
    let embedding = tf.reshape(landmarks, [1, 34]);
    return embedding;
  }

  const runMovenet = async () => {
    try {
      // Ensure TensorFlow.js is ready and set the backend
      await tf.ready();
      await tf.setBackend("webgl");

      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      const poseClassifier = await tf.loadLayersModel(
        "https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json"
      );

      detectorRef.current = detector;
      classifierRef.current = poseClassifier;

      const countAudio = new Audio(count);
      countAudio.loop = true;

      if (interval) clearInterval(interval);

      interval = setInterval(() => {
        detectPose(detector, poseClassifier, countAudio);
      }, 100);

      // Show sequence progress when training starts
      setShowSequenceProgress(true);

      // Initialize completed poses array
      setCompletedPoses([]);
    } catch (error) {
      console.error("Error initializing models:", error);
    }
  };

  const detectPose = async (detector, poseClassifier, countAudio) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      try {
        let notDetected = 0;
        const video = webcamRef.current.video;
        const pose = await detector.estimatePoses(video);
        const ctx = canvasRef.current.getContext("2d");

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvasRef.current.width, 0);

        const keypoints = pose[0].keypoints;

        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (
              !(keypoint.name === "left_eye" || keypoint.name === "right_eye")
            ) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, "rgb(30,30,30)");
              let connections = keypointConnections[keypoint.name];
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase();
                  drawSegment(
                    ctx,
                    [keypoint.x, keypoint.y],
                    [
                      keypoints[POINTS[conName]].x,
                      keypoints[POINTS[conName]].y,
                    ],
                    skeletonColor
                  );
                });
              } catch (err) {}
            }
          } else {
            notDetected += 1;
          }
          return [keypoint.x, keypoint.y];
        });

        if (notDetected > 4) {
          skeletonColor = "rgb(30,30,30)";
          ctx.restore();
          return;
        }

        const processedInput = landmarks_to_embedding(input);
        const classification = poseClassifier.predict(processedInput);

        classification.array().then((data) => {
          const classNo = CLASS_NO[currentPose];
          const confidence = data[0][classNo] * 100;

          currentConfidenceValue = confidence;
          setCurrentConfidence(Math.round(confidence));

          if (confidence > 97) {
            if (!flag) {
              countAudio.play();
              setStartingTime(new Date(Date()).getTime());
              flag = true;
            }
            setCurrentTime(new Date(Date()).getTime());
            skeletonColor = "rgb(0,255,0)";
          } else {
            flag = false;
            skeletonColor = "rgb(30,30,30)";
            countAudio.pause();
            countAudio.currentTime = 0;
          }

          ctx.font = "bold 24px Arial";
          ctx.fillStyle = "rgb(30,30,30)";
          const canvasWidth = canvasRef.current.width;
          ctx.fillText(`Pose: ${currentPose}`, canvasWidth - 200, 50);
          ctx.fillText(`Confidence: ${Math.round(confidence)}%`, 50, 50);

          if (isCurrentlyTraining) {
            ctx.fillText(`Training: ${countdown}s`, canvasWidth - 200, 90);
            ctx.fillText(`Samples: ${confidenceValues.length}`, 50, 90);
          }

          ctx.restore();
        });
      } catch (err) {
        console.log("Error in pose detection:", err);
      }
    }
  };

  const startSamplingConfidence = () => {
    confidenceValues = [];

    samplingInterval = setInterval(() => {
      if (isCurrentlyTraining && currentConfidenceValue > 0) {
        confidenceValues.push(currentConfidenceValue);
        setSamples(confidenceValues.length);
        console.log(
          "Added confidence:",
          currentConfidenceValue,
          "Total samples:",
          confidenceValues.length
        );
      }
    }, 100);
  };

  const predictIQ = (score) => {
    if (score >= 9) {
      return "140-160 (Genius)";
    } else if (score >= 8) {
      return "120-140 (Highly Intelligent)";
    } else if (score >= 7) {
      return "110-120 (Above Average)";
    } else if (score >= 6) {
      return "90-110 (Average)";
    } else if (score >= 5) {
      return "80-90 (Below Average)";
    } else {
      return "70-80 (Low)";
    }
  };

  const calculateScore = () => {
    console.log("Calculating final score...");
    console.log("Confidence values collected:", confidenceValues.length);

    if (confidenceValues.length === 0) {
      console.log("No confidence values recorded");
      setScore(0);
      setPredictedIQ("N/A");
      return;
    }

    const totalConfidence = confidenceValues.reduce(
      (sum, score) => sum + score,
      0
    );
    const averageConfidence = totalConfidence / confidenceValues.length;

    const finalScore = (averageConfidence / 100) * 10;
    setScore(finalScore.toFixed(2));
    setSamples(confidenceValues.length);

    const iqRange = predictIQ(finalScore);
    setPredictedIQ(iqRange);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    // Add current pose to completed poses
    if (!completedPoses.includes(currentPose)) {
      setCompletedPoses((prev) => [...prev, currentPose]);
    }

    // Only auto-progress if it's enabled
    if (autoProgress) {
      // Clear any existing timeouts
      if (nextPoseTimeout) {
        clearTimeout(nextPoseTimeout);
      }

      // Set auto-progress pending flag to show the indicator
      setIsAutoProgressPending(true);

      // Schedule next pose change after exactly 3 seconds
      nextPoseTimeout = setTimeout(() => {
        moveToNextPose();
        setIsAutoProgressPending(false);
        nextPoseTimeout = null;
      }, 3000);

      console.log("Auto-progress scheduled in 3 seconds");
    }
  };

  const moveToNextPose = () => {
    // Cancel any pending auto-progress
    if (nextPoseTimeout) {
      clearTimeout(nextPoseTimeout);
      nextPoseTimeout = null;
    }

    setIsAutoProgressPending(false);

    // Find the current pose index
    const currentIndex = poseList.indexOf(currentPose);

    // Determine the next pose (loop back to beginning if at the end)
    const nextIndex = (currentIndex + 1) % poseList.length;
    const nextPose = poseList[nextIndex];

    // Show transition UI
    setNextPoseName(nextPose);
    setShowPoseTransition(true);
    setTransitionCountdown(3);
  };

  useEffect(() => {
    if (countdown == 0 && autoProgress) {
      moveToNextPose();
    }
  }, [countdown]);

  const startTraining = () => {
    console.log("Training started");

    setIsTraining(true);
    isCurrentlyTraining = true;

    setCountdown(10);
    setScore(0);
    setSamples(0);
    confidenceValues = [];

    startSamplingConfidence();

    if (trainingInterval) clearInterval(trainingInterval);

    trainingInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(trainingInterval);
          clearInterval(samplingInterval);
          setIsTraining(false);
          isCurrentlyTraining = false;

          calculateScore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopPose = () => {
    // Clear any pending auto-progress timeouts
    if (nextPoseTimeout) {
      clearTimeout(nextPoseTimeout);
      nextPoseTimeout = null;
    }

    setIsAutoProgressPending(false);
    setIsStartPose(false);
    cleanupAllIntervals();
    isCurrentlyTraining = false;
    setShowSequenceProgress(false);
  };

  const startYoga = () => {
    setIsStartPose(true);
    runMovenet();
  };

  if (isStartPose) {
    return (
      <div className="yoga-container p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-3">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Training: {currentPose} Pose
            </h1>
            <p className="text-gray-600">
              Follow the reference image and maintain the correct posture
            </p>
          </div>

          {/* Pose sequence progress */}
          {showSequenceProgress && (
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full px-4 py-2 shadow-md">
                <div className="flex items-center space-x-2">
                  {poseList.map((pose, index) => (
                    <div
                      key={pose}
                      className={`w-3 h-3 rounded-full ${
                        pose === currentPose
                          ? "bg-blue-500 ring-2 ring-blue-300 ring-opacity-50"
                          : completedPoses.includes(pose)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                      title={pose}
                    />
                  ))}
                  <span className="text-gray-600 text-sm ml-2">
                    {poseList.indexOf(currentPose) + 1}/{poseList.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar for stats */}
            <div className="lg:col-span-1">
              {/* Performance metrics */}
              <div className="bg-white rounded-lg p-4 mb-6 shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Performance
                </h3>
                <div className="text-gray-700">
                  <div className="flex justify-between mb-2">
                    <span>Pose Time:</span>
                    <span className="font-semibold">
                      {poseTime.toFixed(1)} s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Time:</span>
                    <span className="font-semibold">
                      {bestPerform.toFixed(1)} s
                    </span>
                  </div>
                </div>
              </div>

              {/* Reference pose image */}
              <div className="bg-white rounded-lg p-4 mb-6 shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Reference Pose
                </h3>
                <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
                  <img
                    src={poseImages[currentPose]}
                    alt={`${currentPose} pose`}
                    className="max-h-60 object-contain"
                  />
                </div>
              </div>

              {/* Training data */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  {isTraining ? "Training in Progress" : "Training Results"}
                </h3>

                {isTraining && (
                  <div className="text-gray-700">
                    <div className="flex justify-between mb-2">
                      <span>Time Left:</span>
                      <span className="font-semibold">{countdown}s</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Confidence:</span>
                      <span className="font-semibold">
                        {currentConfidence}%
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Samples:</span>
                      <span className="font-semibold">{samples}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {!isTraining && countdown === 0 && (
                  <div className="text-gray-700">
                    <div className="flex justify-between mb-2">
                      <span>Your Score:</span>
                      <span className="font-semibold">{score}/10</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Predicted IQ:</span>
                      <span className="font-semibold">{predictedIQ}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Based on:</span>
                      <span className="font-semibold">{samples} samples</span>
                    </div>

                    {/* Auto-progress indicator */}
                    {autoProgress && isAutoProgressPending && (
                      <div className="mt-4 text-center">
                        <div className="flex justify-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-green-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <p className="text-gray-600 text-sm">
                            Moving to next pose in 3 seconds...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isTraining && countdown !== 0 && (
                  <div className="text-gray-600 italic text-center p-3 bg-gray-100 rounded-lg">
                    Start training to see your results
                  </div>
                )}
              </div>

              {/* Auto-progress toggle */}
              <div className="mt-6 bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    Auto-progress through poses
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={autoProgress}
                      onChange={() => {
                        setAutoProgress(!autoProgress);
                        if (autoProgress) {
                          // If turning off auto-progress, cancel any pending auto-progress
                          if (nextPoseTimeout) {
                            clearTimeout(nextPoseTimeout);
                            nextPoseTimeout = null;
                          }
                          setIsAutoProgressPending(false);
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right - webcam and controls */}
            <div className="lg:col-span-2">
              {/* Webcam container with properly aligned canvas */}
              <div className="relative w-full h-[480px] mb-6 bg-gray-100 rounded-lg overflow-hidden shadow-md border border-gray-200">
                <Webcam
                  width="100%"
                  height="100%"
                  id="webcam"
                  ref={webcamRef}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  mirrored={true}
                />
                <canvas
                  ref={canvasRef}
                  id="my-canvas"
                  width="640"
                  height="480"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                  }}
                />

                {/* Current pose indicator overlay */}
                <div className="absolute top-4 left-4 bg-white bg-opacity-80 px-3 py-2 rounded-lg z-10 shadow-sm">
                  <span className="text-gray-800 font-bold">{currentPose}</span>
                </div>

                {/* Confidence indicator overlay */}
                <div className="absolute top-4 right-4 bg-white bg-opacity-80 px-3 py-2 rounded-lg z-10 shadow-sm">
                  <span className="text-gray-800 font-bold">
                    Confidence: {currentConfidence}%
                  </span>
                </div>

                {/* Training indicator */}
                {isTraining && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 px-4 py-2 rounded-lg z-10 flex items-center shadow-sm">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-white font-semibold">
                      Training: {countdown}s
                    </span>
                  </div>
                )}

                {/* Auto-progress countdown overlay */}
                {!isTraining && isAutoProgressPending && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded-lg z-10 flex items-center shadow-sm">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-white font-semibold">
                      Moving to next pose in 3 seconds...
                    </span>
                  </div>
                )}

                {/* Completed session message */}
                {completedPoses.length === poseList.length && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 max-w-md text-center shadow-lg">
                      <h2 className="text-2xl font-bold text-white mb-3">
                        Great Job!
                      </h2>
                      <p className="text-white mb-4">
                        You've completed all poses in the sequence!
                      </p>
                      <button
                        onClick={stopPose}
                        className="bg-white text-blue-500 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 shadow-sm"
                      >
                        Finish Session
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={stopPose}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Selection
                </button>
                <button
                  onClick={startTraining}
                  className={`text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center shadow-sm ${
                    isTraining
                      ? "bg-blue-400 opacity-75 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isTraining}
                >
                  {isTraining ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Training...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Start Training
                    </>
                  )}
                </button>

                {!isTraining && countdown === 0 && (
                  <button
                    onClick={moveToNextPose}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                    {isAutoProgressPending ? "Skip Wait" : "Next Pose"}
                  </button>
                )}
              </div>

              {/* Tips section */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Training Tips
                </h3>
                <ul className="text-gray-600 space-y-2 pl-1">
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
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
                    Stand in a well-lit area to improve pose detection accuracy
                  </li>
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
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
                    The skeleton turns green when your pose is detected
                    correctly
                  </li>
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
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
                    Training mode monitors your pose for 10 seconds to calculate
                    your score
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Pose transition overlay */}
        {showPoseTransition && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-90">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8 rounded-xl shadow-lg max-w-md text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Moving to Next Pose
              </h2>
              <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-lg p-2 flex items-center justify-center">
                <img
                  src={poseImages[nextPoseName]}
                  alt={nextPoseName}
                  className="object-contain max-h-full"
                />
              </div>
              <p className="text-xl text-white font-semibold mb-2">
                {nextPoseName} Pose
              </p>
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mt-4 mb-2">
                <span className="text-2xl font-bold text-blue-500">
                  {transitionCountdown}
                </span>
              </div>
              <p className="text-sm text-gray-100">Get ready to begin...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Selection page (converted to white theme)
  return (
    <div className="yoga-container bg-white p-6">
      <DropDown
        poseList={poseList}
        currentPose={currentPose}
        setCurrentPose={setCurrentPose}
      />
      <Button
        onClick={startYoga}
        className="text-xl bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
      >
        Start Pose
      </Button>
      <Instructions currentPose={currentPose} />
    </div>
  );
}

export default Yoga;