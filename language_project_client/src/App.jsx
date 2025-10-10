import React, { useState, useEffect, useCallback } from "react";
import ProgressBar from './utils/ProgressBar';
import Modal from './utils/Modal';
import { motion, AnimatePresence } from "framer-motion";
import './App.css'



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
      const res = await fetch("http://localhost:3000/new-word", {
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
    addHint();
    if (!currentHint.trim()) return;
    const res = await fetch("http://localhost:3000/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHint: currentHint.trim(), gameId }),
    });
    const data = await res.json();
    await wait(1500);
    setIsloadingguess(false);
    setChecking(true);
    setGuess(data.guess);
    await wait(2000);
    if (data.correct) {
      setSuccess(true);
      setProgress(progress + 100);
      await wait(2000);
      setGuess("");
      await wait(800);
      setChecking(false);
      setTries(3);
      if (progress == 900) {
        setGameCompleted(true);
      } else {
        newWord();
      }
    } else {
      setWrong(true);
      await wait(2000);
      setTries(tries - 1);
      setGuess("");
      await wait(800);
      setWrong(false);
      setChecking(false);
      setAiGuesses([...aiGuesses, data.guess]);
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
        <button className="ml-10" popovertarget="my-popover">
          About...
        </button>
        <div className="overflow-y-auto" id="my-popover" popover="auto">
          <p>
          In Other Words is inspired by the classic game Taboo, but reimagined as a tool for developing expressive power and linguistic agility.
          <br/>
          <br/>
          One of the traits of someone with strong language ability isn’t just vocabulary size — it’s the ability to express meaning even when the perfect word isn’t available. Skilled speakers and writers can reshape their ideas, reframe their sentences, and find new routes to the same destination.
          <br/>
          When learning a new language, this skill becomes even more essential. There will always be moments when the word you want is just out of reach — when your mind knows the concept but not yet the label for it. What matters then is your capacity to think around the missing word, to describe, to improvise, and to stay fluid in expression.
          <br/>
          <br/>
          That challenge — and the creativity it sparks — is the heart of In Other Words.
          This game turns linguistic constraint into play. By forcing you to avoid obvious synonyms and find new ways to communicate, it helps you train the most powerful aspect of language learning: the ability to make yourself understood, no matter the words you lack.
          <br/>
          Every round becomes a small act of linguistic problem-solving — a moment where you stretch the edges of your vocabulary and strengthen your fluency through imagination and precision.
          </p>
          <br/>
          🎮 How to Play<br/>
          <ul className="list-disc list-inside">
            <li>
              The game generates a word in English.
            </li>
            <li>
            You’re shown a list of forbidden words — close synonyms or related terms you cannot use.
            </li>
            <li>
              Your goal is to give hints that describe the hidden word in Spanish, without using any of the forbidden words or their derivatives.
            </li>            
            <li>
              The guess will be generated based on each hint you provide.
            </li>
            <li>
              You have three tries to guide the AI to the correct answer.
            </li>
          </ul>
          <br/>
          The challenge is to communicate meaning indirectly — to express the essence of an idea without leaning on the most obvious words. It’s a playful, focused way to strengthen how you think and communicate in language — especially when words fail you.
          <br/>
          This game is about thinking flexibly in language.
          <br/>
          By practicing how to describe, reframe, and paraphrase, you’re training one of the most powerful tools in human communication:
          The ability to express yourself in a multitude of ways.
        </div>
      </header>
      <div className="flex flex-col items-center min-h-screen bg-slate-700 p-6 text-slate-700">
        <div className="w-full bg-gray-400 rounded-xl max-w-172 shadow-lg shadow-gray-900 p-6 mt-4 text-center min-h-184">
          <h1 className="text-xl font-bold mb-2">In Other Words</h1>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="flex justify-between text-white">
              <button className="m-1 modal-button" onClick={startNewGame}>Beginner</button>
              <button className="m-1 modal-button" onClick={startNewGame}>Intermediate</button>
              <button className="m-1 modal-button" onClick={startNewGame}>Advanced</button>
              <button className="m-1 modal-button" onClick={startNewGame}>Expert</button>
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
            <div className="flex justify-center my-4">
              <motion.span layout className="mb-4 text-lg font-bold">
                Forbidden Words:&nbsp;&nbsp;
              </motion.span>
              <AnimatePresence mode="popLayout">
                {similarwords.length > 0 && (
                  <motion.span
                    key={similarwords.join(',')}
                    layout
                    initial={{ opacity: 0, y: -10 }}  // fade + slide from top
                    animate={{ opacity: 1, y: 0 }}     // fade in + settle
                    exit={{ opacity: 0, y: 10 }}       // fade + slide down
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="font-bold text-lg"
                  >
                    {similarwords.map(String).join(", ")}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col mb-4 space-y-2 text-center items-center">
              <input
              type="text"
              placeholder="Write a hint in Spanish..."
              value={currentHint}
              onChange={(e) => setCurrentHint(e.target.value)}
              className="w-full p-2 border rounded-md"
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
                      key={tries} // important! tells Framer it's a new element
                      initial={{ y: -40, opacity: 0 }}  // start above
                      animate={{ y: 0, opacity: 1 }}     // slide in
                      exit={{ y: 40, opacity: 0 }}       // slide down & fade out
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
                    key={h + idx} // unique key is important for AnimatePresence
                    initial={{ opacity: 0, y: -10 }}   // start slightly above
                    animate={{ opacity: 1, y: 0 }}     // fade/slide in
                    exit={{ opacity: 0, y: 10 }}       // fade/slide out (if removed)
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    layout // optional, for smooth repositioning of other items
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
          </div>
        </div>
      </div>
    </>
  );
}