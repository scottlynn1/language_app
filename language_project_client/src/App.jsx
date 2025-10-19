import React, { useState, useEffect, useCallback } from "react";
import ProgressBar from './utils/ProgressBar';
import Modal from './utils/Modal';
import { motion, AnimatePresence } from "framer-motion";
import './App.css'
import HeaderContent from "./utils/HeaderContent";

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function WordGuessGame() {
  const [word, setWord] = useState("Word");
  const [similarwords, setSimilarwords] = useState([])
  const [hints, setHints] = useState([]);
  const [currentHint, setCurrentHint] = useState("");
  const [aiGuesses, setAiGuesses] = useState([]);
  const [success, setSuccess] = useState(false);
  const [tries, setTries] = useState(3);
  const [fail, setFail] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gameId, setGameId] = useState(null);
  const [isloadingword, setIsloadingword] = useState(false);
  const [isloadingguess, setIsloadingguess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [gameCompleted, setGameCompleted] = useState(false);
  const [guess, setGuess] = useState("");
  const [checking, setChecking] = useState(false);
  const [wrong, setWrong] = useState(false);

  const startNewGame = (e) => {
    setGameCompleted(false);
    setIsModalOpen(false);
    setWord("");
    setCurrentHint("");
    setSimilarwords([]);
    setHints([]);
    setAiGuesses([]);
    setTries(3);
    setSuccess(false);
    setFail(false);
    setProgress(0);
    if (e.target.innerText.toLowerCase() == difficulty) {
      newWord();
    } else setDifficulty(e.target.innerText.toLowerCase())
  };

  
  const newWord = useCallback( async () => {
    setWord("Generating Word");
    setSimilarwords([]);
    setHints([]);
    setAiGuesses([]);
    setTries(3);
    setSuccess(false);
    setFail(false);
    await wait (1200);
    setWord("")
    await wait (800);
    setIsloadingword(true);
    await wait(1500);
    try {
      const res = await fetch(`${API_BASE}/new-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      if (!res.ok) throw new Error(`server error: ${res.status}`)
        const data = await res.json();
      setIsloadingword(false);
      setWord(data.english);
      setSimilarwords(data.synonyms);
      setGameId(data.gameId);
    } catch (err) {
      setIsloadingword(false);
      console.log(err)
    }
  }, [difficulty])

  useEffect(() => {
    if (!difficulty) return;
    newWord();
  }, [newWord, difficulty])

  const addHint = () => {
    if (!currentHint.trim()) return;
    setHints([...hints, currentHint]);
    setCurrentHint("");
  };

  const aiMakeGuess = async () => {
    if (!currentHint || !word || fail || success || gameCompleted) return;
    setIsloadingguess(true);
    if (!currentHint.trim()) return;
    const res = await fetch(`${API_BASE}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHint: currentHint.trim(), gameId }),
    });
    const data = await res.json();
    await wait(1500);
    setIsloadingguess(false);
    if (data.correct) {
      setChecking(true);
      setGuess(data.guess);
      await wait(2000);
      setSuccess(true);
      setProgress(progress + 100);
      await wait(2000);
      setGuess("");
      addHint();
      await wait(800);
      setChecking(false);
      setTries(3);
      if (progress == 900) {
        setGameCompleted(true);
      } else {
        newWord();
      }
    } else {
      setChecking(true);
      if (data.guess == "forbidden") {
        setGuess("You used a forbidden word. Try again")
      } else if (data.guess == "target") {
        setGuess("You used the target word. Try again")
      } else {
        setGuess(data.guess);
      }
      await wait(2000);
      setWrong(true);
      await wait(2000);
      if (data.guess !== "forbidden" && data.guess !== "target") {
        setTries(tries - 1);
      }
      setGuess("");
      await wait(800);
      setWrong(false);
      setChecking(false);
      if (data.guess !== "forbidden" && data.guess !== "target") {
        setAiGuesses([...aiGuesses, data.guess]);
        addHint();
      }
      if (tries < 2) {
        setFail(true);
        await wait(2000);
        newWord();
      }
    }
  };

  const variants = {
    normal: { x: 0, opacity: 1, scale: 1 },
    success: { x: 0, opacity: 1, scale: [1, 1.3, 1], transition: { duration: 0.4 } },
    wrong: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    exitSuccess: { y: -40, opacity: 0 },
    exitWrong: {x: 0, y: 40, opacity: 0},
  };
  

  return (
    <>
      <header className="p-2">
        <HeaderContent/>
      </header>
      <div className="flex flex-col items-center min-h-screen bg-slate-700 p-6 text-slate-700">
        <div className="w-full bg-gray-400 rounded-xl max-w-172 shadow-lg shadow-gray-900 p-6 mt-4 text-center min-h-184">
          <h1 className="text-xl font-bold mb-2">In Other Words</h1>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="flex flex-col sm:flex-row justify-between items-center text-white">
              <button className="m-1 modal-button" onClick={startNewGame}>Beginner</button>
              {/* <button className="m-1 modal-button" onClick={startNewGame}>Intermediate</button> */}
              <button className="m-1 modal-button" onClick={startNewGame}>Advanced</button>
              {/* <button className="m-1 modal-button" onClick={startNewGame}>Expert</button> */}
            </div>
          </Modal>
          <ProgressBar
            value={progress}
            max={1000}
            animated
          />
          { gameCompleted && (
            <p className="text-green-600 font-bold">Level Completed!</p>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Start New Game
          </button>
          <div className="text-center h-12 mt-4 flex flex-col items-center">
            <div className="relative mb-8 flex justify-center">
              { isloadingword ?
                <span className='loader'>
                  <span></span>
                  <span></span>
                  <span></span>
                </span> :
                <AnimatePresence>
                  <motion.p
                    key={word}
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 40, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute font-bold text-xl whitespace-nowrap"
                  >{word}</motion.p>
                </AnimatePresence>
              }
            </div>
            { checking &&
              <AnimatePresence>
                <motion.p
                  variants={variants}
                  key={guess}
                  initial={{ x: 140, opacity: 0 }}
                  animate={ success ? "success" : wrong ? "wrong" : "normal"}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  exit={ success ? "exitSuccess" : wrong ? "exitWrong" : "normal"}
                  className={`font-bold text-xl ${success ? "text-green-200" : wrong ? "text-red-200" : "text-black"}`}
                >{ guess }</motion.p>
              </AnimatePresence>
            }
          </div>
          <div>
            <div className="flex flex-col sm:flex-row justify-center my-4">
              <motion.span layout className="mb-4 text-lg font-bold">
                Forbidden Words:&nbsp;&nbsp;
              </motion.span>
              <AnimatePresence mode="popLayout">
                {similarwords.length > 0 && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    {similarwords.map((word) => (
                      <motion.span
                        key={word}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="font-bold text-lg underline"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
            <motion.div layout>
              <div className="flex flex-col mb-4 space-y-2 text-center items-center">
                <input
                type="text"
                placeholder="Write a hint in Spanish..."
                value={currentHint}
                onChange={(e) => setCurrentHint(e.target.value)}
                className="w-full p-2 border rounded-md placeholder-gray-700"
                />
                <button
                onClick={aiMakeGuess}
                className="w-38 text-white py-2 rounded-md"
                >
                Try this hint
                </button>
                { success && (
                  <p className="text-green-200 font-bold">Guessed correctly!</p>
                )}
                { fail && (
                  <p className="text-red-200 font-bold">All out of attempts!</p>
                )}
                { fail || success || (
                  <div className="text-lg">
                    <span className="font-bold">
                      Attempts Left:&nbsp;
                    </span>
                    <AnimatePresence>
                      <motion.span
                        key={tries} 
                        initial={{ y: -40, opacity: 0 }}  
                        animate={{ y: 0, opacity: 1 }}  
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute font-bold"
                        >
                        {tries}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h3 className="font-semibold">Hints Provided:</h3>
                <ul className="list-none list-inside text-gray-700 space-y-1 relative">
                  <AnimatePresence>
                    {hints.map((h, idx) => (
                      <motion.li
                      key={h + idx}
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }}  
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      layout 
                      >
                        {h}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold">Guesses:</h3>
                <ul className="list-none list-inside text-gray-700 space-y-1 relative">
                <AnimatePresence>
                  {aiGuesses.map((g, idx) => (
                    <motion.li
                    key={g + idx}
                    initial={{ opacity: 0, y: -10}}
                    animate={{ opacity: 1, y: 0}}
                    exit={{ opacity: 0, y: 10}}
                        transition={{ duration: 0.4, ease: "easeOut"}}
                        layout
                        >
                        {g}
                      </motion.li>
                    ))}
                </AnimatePresence>
                { isloadingguess ?
                  <span className='loader'>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span> : <></>
                }
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

{/* <button onclick="insertAccent('á')">á</button>
<button onclick="insertAccent('é')">é</button>
<button onclick="insertAccent('í')">í</button>
<button onclick="insertAccent('ó')">ó</button>
<button onclick="insertAccent('ú')">ú</button>
<button onclick="insertAccent('ñ')">ñ</button> */}
