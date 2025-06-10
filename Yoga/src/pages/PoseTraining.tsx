import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import backend from '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import { count } from '../utils/music';
import { poseImages } from '../utils/pose_images';
import { POINTS, keypointConnections } from '../utils/data';
import { drawPoint, drawSegment } from '../utils/helper';
import './Yoga.css';

let skeletonColor = 'rgb(255,255,255)';
let interval;
let trainingInterval;
let samplingInterval;
let confidenceValues = [];
let currentConfidenceValue = 0;
let isCurrentlyTraining = false;
let flag = false;

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

function PoseTraining() {
  const { pose } = useParams();
  const navigate = useNavigate();
  
  // Ensure we have a valid pose, or redirect back to selection
  const currentPose = pose && Object.keys(CLASS_NO).includes(pose) ? pose : 'Tree';
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const classifierRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [score, setScore] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [samples, setSamples] = useState(0);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [predictedIQ, setPredictedIQ] = useState(null);

  useEffect(() => {
    // Start the pose detection immediately when component mounts
    runMovenet();
    
    return () => {
      cleanupAllIntervals();
    };
  }, []);
  
  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    if (flag) {
      setPoseTime(timeDiff);
    }
    if ((currentTime - startingTime) / 1000 > bestPerform) {
      setBestPerform(timeDiff);
    }
  }, [currentTime]);

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
    let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
    let shoulders_center = get_center_point(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER);
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
    let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
    pose_center_new = tf.expandDims(pose_center_new, 1);

    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
    let max_dist = tf.max(tf.norm(d, 'euclidean', 0));

    let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist);
    return pose_size;
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
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
      await tf.setBackend('webgl');

      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      const poseClassifier = await tf.loadLayersModel('https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json');

      detectorRef.current = detector;
      classifierRef.current = poseClassifier;

      const countAudio = new Audio(count);
      countAudio.loop = true;

      if (interval) clearInterval(interval);

      interval = setInterval(() => {
        detectPose(detector, poseClassifier, countAudio);
      }, 100);
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
        const ctx = canvasRef.current.getContext('2d');

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvasRef.current.width, 0);

        const keypoints = pose[0].keypoints;

        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)');
              let connections = keypointConnections[keypoint.name];
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase();
                  drawSegment(
                    ctx,
                    [keypoint.x, keypoint.y],
                    [keypoints[POINTS[conName]].x, keypoints[POINTS[conName]].y],
                    skeletonColor
                  );
                });
              } catch (err) { }
            }
          } else {
            notDetected += 1;
          }
          return [keypoint.x, keypoint.y];
        });

        if (notDetected > 4) {
          skeletonColor = 'rgb(255,255,255)';
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
            skeletonColor = 'rgb(0,255,0)';
          } else {
            flag = false;
            skeletonColor = 'rgb(255,255,255)';
            countAudio.pause();
            countAudio.currentTime = 0;
          }

          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = 'rgb(255,255,255)';
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
        console.log("Added confidence:", currentConfidenceValue, "Total samples:", confidenceValues.length);
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

  const startTraining = () => {
    console.log('Training started');

    setIsTraining(true);
    isCurrentlyTraining = true;

    setCountdown(20);
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

  const calculateScore = () => {
    console.log('Calculating final score...');
    console.log('Confidence values collected:', confidenceValues.length);

    if (confidenceValues.length === 0) {
      console.log('No confidence values recorded');
      setScore(0);
      setPredictedIQ("N/A");
      return;
    }

    const totalConfidence = confidenceValues.reduce((sum, score) => sum + score, 0);
    const averageConfidence = totalConfidence / confidenceValues.length;

    const finalScore = (averageConfidence / 100) * 10;
    setScore(finalScore.toFixed(2));
    setSamples(confidenceValues.length);

    const iqRange = predictIQ(finalScore);
    setPredictedIQ(iqRange);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const goBackToSelection = () => {
    cleanupAllIntervals();
    isCurrentlyTraining = false;
    navigate('/');
  };

  return (
    <div className="yoga-container p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar for stats */}
          <div className="lg:col-span-1">
            {/* Performance metrics */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Performance</h3>
              <div className="text-white">
                <div className="flex justify-between mb-2">
                  <span>Pose Time:</span>
                  <span className="font-semibold">{poseTime.toFixed(1)} s</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Time:</span>
                  <span className="font-semibold">{bestPerform.toFixed(1)} s</span>
                </div>
              </div>
            </div>

            {/* Reference pose image */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Reference Pose</h3>
              <div className="flex justify-center">
                <img 
                  src={poseImages[currentPose]} 
                  alt={`${currentPose} pose`} 
                  className="max-h-60 object-contain" 
                />
              </div>
            </div>

            {/* Training data */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                {isTraining ? "Training in Progress" : "Training Results"}
              </h3>
              
              {isTraining && (
                <div className="text-white">
                  <div className="flex justify-between mb-2">
                    <span>Time Left:</span>
                    <span className="font-semibold">{countdown}s</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Confidence:</span>
                    <span className="font-semibold">{currentConfidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samples:</span>
                    <span className="font-semibold">{samples}</span>
                  </div>
                </div>
              )}
              
              {!isTraining && countdown === 0 && (
                <div className="text-white">
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
                </div>
              )}
              
              {!isTraining && countdown === 60 && (
                <div className="text-gray-300 italic text-center">
                  Start training to see your results
                </div>
              )}
            </div>
          </div>

          {/* Center and right - webcam and controls */}
          <div className="lg:col-span-2">
            {/* Webcam container with properly aligned canvas */}
            <div className="relative w-full h-[480px] mb-6 bg-black rounded-lg overflow-hidden shadow-xl">
              <Webcam
                width="100%"
                height="100%"
                id="webcam"
                ref={webcamRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                mirrored={true}
              />
              <canvas
                ref={canvasRef}
                id="my-canvas"
                width="640"
                height="480"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1
                }}
              />
              
              {/* Current pose indicator overlay */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded-lg z-10">
                <span className="text-white font-bold">{currentPose}</span>
              </div>
              
              {/* Confidence indicator overlay */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-2 rounded-lg z-10">
                <span className="text-white font-bold">Confidence: {currentConfidence}%</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center space-x-4">
              <button 
                onClick={goBackToSelection}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Pose Selection
              </button>
              <button
                onClick={startTraining}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                disabled={isTraining}
              >
                {isTraining ? "Training..." : "Train Me"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoseTraining;