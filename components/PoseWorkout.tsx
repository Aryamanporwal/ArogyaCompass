"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Camera } from "@mediapipe/camera_utils";
import type { Results as PoseResults, NormalizedLandmark } from "@mediapipe/pose";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

function calculateAngle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);
  let angle = (radians * 180.0) / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

function distance(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const PoseWorkout: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Selected Exercise
  const [exercise, setExercise] = useState<"squats" | "rightCurl" | "leftCurl" | "jumpingJacks">("squats");

  // Use refs to hold counters and stages, avoid rerenders and effect reruns
  const countersRef = useRef({
    squats: 0,
    rightCurl: 0,
    leftCurl: 0,
    jumpingJacks: 0,
  });
  const stagesRef = useRef({
    squats: "up" as "up" | "down",
    rightCurl: "down" as "up" | "down",
    leftCurl: "down" as "up" | "down",
    jumpingJacks: "close" as "open" | "close",
  });

  // For alert messages
  const [alertMsg, setAlertMsg] = useState("");

  // To force UI update when counters change
  const [, setUiTick] = useState({});

  // MediaPipe and drawing utils refs
  const initializedRef = useRef(false);
  const poseInstanceRef = useRef<import("@mediapipe/pose").Pose | null>(null);
  const cameraInstanceRef = useRef<Camera | null>(null);

  const connectionsRef = useRef<typeof import("@mediapipe/pose").POSE_CONNECTIONS | null>(null);
  const drawConnectorsRef = useRef<typeof import("@mediapipe/drawing_utils").drawConnectors | null>(null);
  const drawLandmarksRef = useRef<typeof import("@mediapipe/drawing_utils").drawLandmarks | null>(null);

  // Store the latest exercise in a ref for stable callback usage
  const exerciseRef = useRef(exercise);
  useEffect(() => {
    exerciseRef.current = exercise;
  }, [exercise]);

  // This callback processes pose results and updates counters/stages accordingly
  const onResults = useCallback((results: PoseResults) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (results.image) {
      ctx.drawImage(results.image as HTMLCanvasElement, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    const lm = results.poseLandmarks;
    if (lm && drawConnectorsRef.current && drawLandmarksRef.current && connectionsRef.current) {
      drawConnectorsRef.current(ctx, lm, connectionsRef.current, { color: "#00FF00", lineWidth: 4 });
      drawLandmarksRef.current(ctx, lm, { color: "#FF0000", lineWidth: 2 });

      setAlertMsg("");

      const currentExercise = exerciseRef.current;

      if (currentExercise === "squats") {
        const hip = lm[24], knee = lm[26], ankle = lm[28];
        if (hip && knee && ankle) {
          const angle = calculateAngle(hip, knee, ankle);
          ctx.fillStyle = "yellow";
          ctx.fillText(`Squat: ${Math.round(angle)}°`, knee.x * CANVAS_WIDTH, knee.y * CANVAS_HEIGHT - 20);

          if (angle > 160) stagesRef.current.squats = "up";
          if (angle < 90 && stagesRef.current.squats === "up") {
            stagesRef.current.squats = "down";
            countersRef.current.squats += 1;
            setUiTick({});
          }
        }
      }

      if (currentExercise === "rightCurl") {
        const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
        if (rShoulder && rElbow && rWrist) {
          const angle = calculateAngle(rShoulder, rElbow, rWrist);
          ctx.fillStyle = "cyan";
          ctx.fillText(`R-Curl: ${Math.round(angle)}°`, rElbow.x * CANVAS_WIDTH, rElbow.y * CANVAS_HEIGHT - 30);

          if (angle < 40 && stagesRef.current.rightCurl === "down") {
            stagesRef.current.rightCurl = "up";
          }
          if (angle > 160 && stagesRef.current.rightCurl === "up") {
            stagesRef.current.rightCurl = "down";
            countersRef.current.rightCurl += 1;
            setUiTick({});
          }
        }
      }

      if (currentExercise === "leftCurl") {
        const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
        if (lShoulder && lElbow && lWrist) {
          const angle = calculateAngle(lShoulder, lElbow, lWrist);
          ctx.fillStyle = "lime";
          ctx.fillText(`L-Curl: ${Math.round(angle)}°`, lElbow.x * CANVAS_WIDTH, lElbow.y * CANVAS_HEIGHT - 30);

          if (angle < 40 && stagesRef.current.leftCurl === "down") {
            stagesRef.current.leftCurl = "up";
          }
          if (angle > 160 && stagesRef.current.leftCurl === "up") {
            stagesRef.current.leftCurl = "down";
            countersRef.current.leftCurl += 1;
            setUiTick({});
          }
        }
      }

      if (currentExercise === "jumpingJacks") {
        const lWrist = lm[15], rWrist = lm[16], lAnkle = lm[27], rAnkle = lm[28], nose = lm[0];
        if (lWrist && rWrist && lAnkle && rAnkle && nose) {
          const armsUp = lWrist.y < nose.y && rWrist.y < nose.y;
          const ankleDist = distance(lAnkle, rAnkle);
          const legsOpen = ankleDist > 0.25;

          if (armsUp && legsOpen) {
            stagesRef.current.jumpingJacks = "open";
          }
          if (!armsUp && !legsOpen && stagesRef.current.jumpingJacks === "open") {
            stagesRef.current.jumpingJacks = "close";
            countersRef.current.jumpingJacks += 1;
            setUiTick({});
          }

          if (!armsUp && legsOpen) {
            setAlertMsg("⚠️ Raise your arms higher!");
          } else if (armsUp && !legsOpen) {
            setAlertMsg("⚠️ Spread your legs wider!");
          }
        }
      }
    }

    ctx.restore();
  }, []);

  // MediaPipe initialization only once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let isMounted = true;
    let destroyRequested = false;

    async function setup() {
      try {
        const mpPose = await import("@mediapipe/pose");
        const mpDrawing = await import("@mediapipe/drawing_utils");
        const mpCamera = await import("@mediapipe/camera_utils");

        connectionsRef.current = mpPose.POSE_CONNECTIONS;
        drawConnectorsRef.current = mpDrawing.drawConnectors;
        drawLandmarksRef.current = mpDrawing.drawLandmarks;

        const pose = new mpPose.Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        pose.onResults(onResults);
        poseInstanceRef.current = pose;

        if (videoRef.current) {
          const camera = new mpCamera.Camera(videoRef.current, {
            onFrame: async () => {
              if (!isMounted || destroyRequested) return;
              await pose.send({ image: videoRef.current as HTMLVideoElement });
            },
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          });
          cameraInstanceRef.current = camera;
          camera.start();
        }
      } catch (err) {
        console.error("Failed to load MediaPipe modules", err);
      }
    }

    setup();

    return () => {
      destroyRequested = true;
      isMounted = false;
      try {
        cameraInstanceRef.current?.stop();
      } catch {}
      poseInstanceRef.current = null;
    };
  }, [onResults]);

  const currentCount = countersRef.current[exercise];

  const resetCount = () => {
    countersRef.current[exercise] = 0;
    setUiTick({});
  };

  return (
    <div className="h-screen overflow-auto hide-scrollbar bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            AI Pose Trainer
          </h1>
          <p className="text-gray-400 text-lg">Real-time exercise tracking with computer vision</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Exercise Selection Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Select Exercise
              </h2>
              <div className="grid gap-3">
                <button
                  onClick={() => setExercise("squats")}
                  className={`p-4 rounded-xl transition-all duration-300 border-2 ${
                    exercise === "squats"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent shadow-lg scale-105"
                      : "bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏋️‍♂️</span>
                    <span className="font-medium">Squats</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setExercise("rightCurl")}
                  className={`p-4 rounded-xl transition-all duration-300 border-2 ${
                    exercise === "rightCurl"
                      ? "bg-gradient-to-r from-green-500 to-teal-600 border-transparent shadow-lg scale-105"
                      : "bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💪</span>
                    <span className="font-medium">Right Bicep Curl</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setExercise("leftCurl")}
                  className={`p-4 rounded-xl transition-all duration-300 border-2 ${
                    exercise === "leftCurl"
                      ? "bg-gradient-to-r from-orange-500 to-red-600 border-transparent shadow-lg scale-105"
                      : "bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💪</span>
                    <span className="font-medium">Left Bicep Curl</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setExercise("jumpingJacks")}
                  className={`p-4 rounded-xl transition-all duration-300 border-2 ${
                    exercise === "jumpingJacks"
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 border-transparent shadow-lg scale-105"
                      : "bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤸‍♂️</span>
                    <span className="font-medium">Jumping Jacks</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Current Exercise Stats */}
            <div className={`rounded-2xl p-6 text-white shadow-xl ${
              exercise === "squats" ? "bg-gradient-to-br from-blue-500 to-purple-600" :
              exercise === "rightCurl" ? "bg-gradient-to-br from-green-500 to-teal-600" :
              exercise === "leftCurl" ? "bg-gradient-to-br from-orange-500 to-red-600" :
              "bg-gradient-to-br from-pink-500 to-rose-600"
            }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {exercise === "squats" ? "🏋️‍♂️" :
                   exercise === "rightCurl" ? "💪" :
                   exercise === "leftCurl" ? "💪" :
                   "🤸‍♂️"}
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  {exercise === "squats" ? "Squats" :
                   exercise === "rightCurl" ? "Right Bicep Curl" :
                   exercise === "leftCurl" ? "Left Bicep Curl" :
                   "Jumping Jacks"}
                </h3>
                <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold mb-1">{currentCount}</div>
                  <div className="text-sm opacity-90">Repetitions</div>
                </div>
                <button
                  onClick={resetCount}
                  className="mt-4 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm"
                >
                  Reset Counter
                </button>
              </div>
            </div>

            {/* Alert Panel */}
            {alertMsg && (
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-semibold text-amber-300">Form Alert</div>
                    <div className="text-amber-100 text-sm">{alertMsg.replace('⚠️ ', '')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">📹</span>
                  Live Camera Feed
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Recording
                </div>
              </div>
              
              <div className="relative">
                <video ref={videoRef} className="hidden" playsInline />
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="w-full h-auto rounded-xl border border-gray-600/50 shadow-lg bg-black"
                />
                
                {/* Overlay UI Elements */}
                <div className="absolute top-4 left-4">
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={
                        exercise === "squats" ? "text-blue-700" :
                        exercise === "rightCurl" ? "text-green-700" :
                        exercise === "leftCurl" ? "text-orange-700" :
                        "text-pink-700"
                      }>
                        {exercise === "squats" ? "🏋️‍♂️" :
                         exercise === "rightCurl" ? "💪" :
                         exercise === "leftCurl" ? "💪" :
                         "🤸‍♂️"}
                      </span>
                      <span className="text-white font-medium">
                        {exercise === "squats" ? "Squats" :
                         exercise === "rightCurl" ? "Right Bicep Curl" :
                         exercise === "leftCurl" ? "Left Bicep Curl" :
                         "Jumping Jacks"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4">
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{currentCount}</div>
                      <div className="text-xs text-gray-300">REPS</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-400">
                Stand in front of the camera and perform your selected exercise. 
                The AI will automatically track your movements and count repetitions.
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Instructions */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Exercise Tips
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="font-medium text-blue-300 mb-1">🏋️‍♂️ Squats</div>
              <div className="text-gray-300">Keep your back straight, lower until thighs are parallel to ground</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="font-medium text-green-300 mb-1">💪 Bicep Curls</div>
              <div className="text-gray-300">Keep elbow stationary, curl weight up to shoulder level</div>
            </div>
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
              <div className="font-medium text-pink-300 mb-1">🤸‍♂️ Jumping Jacks</div>
              <div className="text-gray-300">Jump while spreading legs and raising arms overhead</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="font-medium text-purple-300 mb-1">📐 Angles</div>
              <div className="text-gray-300">Joint angles are displayed in real-time for form feedback</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseWorkout;