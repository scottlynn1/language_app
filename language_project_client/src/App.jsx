import React, { useState } from "react";
import ProgressBar from './utils/ProgressBar';
import Modal from './utils/Modal';
import { motion, AnimatePresence } from "framer-motion";


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
    setDifficulty(e.target.innerText.toLowerCase())
    newWord();
  };
  
  const newWord = async () => {
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
      setSimilarwords([...data.synonyms]);
      setGameId(data.gameId);
    } catch (err) {
      setIsloadingword(false);
      console.log(err)
    }
  }

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
    setAiGuesses([...aiGuesses, data.guess]);
    if (data.correct) {
      setSuccess(true);
      setTries(3);
      setProgress(progress + 100)
      if (progress == 900) {
        setGameCompleted(true);
      } else {
        await wait(2000);
        newWord();
      }
    }
    else setTries(tries - 1);
    if (tries < 2) {
      setFail(true);
      await wait(2000);
      newWord();
    }
  };


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-500 p-6">
      <div className="w-full bg-gray-400 rounded-xl max-w-172 shadow-lg p-6 text-center">
        <h1 className="text-xl font-bold mb-2">In Other Words</h1>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="flex justify-between">
            <button className="m-1" onClick={startNewGame}>Beginner</button>
            <button className="m-1" onClick={startNewGame}>Intermediate</button>
            <button className="m-1" onClick={startNewGame}>Advanced</button>
            <button className="m-1" onClick={startNewGame}>Expert</button>
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
        {/* <button
          onClick={newWord}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          New Word
        </button> */}
        <div className="text-center h-12 mt-4">
          <div className="mb-4">
            {/* <span className="mb-4 font-bold">Word:&nbsp;</span> */}
              { isloadingword ?
                <span className='loader'>
                  <span></span>
                  <span></span>
                  <span></span>
                </span> : <AnimatePresence mode="popLayout">
                  <motion.strong
                    key={word} // important! tells Framer it's a new element
                    initial={{ x: -40, opacity: 0 }}  // start above
                    animate={{ x: 0, opacity: 1 }}     // slide in
                    exit={{ x: 40, opacity: 0 }}       // slide down & fade out
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="font-bold"
                  >{word}</motion.strong>
                </AnimatePresence>
              }
          </div>
        </div>

      <div>
        <div className="flex justify-center mb-4">
          <motion.span layout className="mb-4">
            Forbidden Words:&nbsp;
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
                className="font-bold"
              >
                {similarwords.join(', ')}
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
          className="w-38 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
          Try this hint
          </button>
          { success && (
            <p className="text-green-600 font-bold">Guessed correctly!</p>
          )}
          
          { fail && (
            <p className="text-red-600 font-bold">All out of attempts!</p>
          )}
          { fail || success || (
            <div>
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
          <ul className="list-disc list-inside text-gray-700 space-y-1 relative">
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
          <ul className="list-disc list-inside text-gray-700 space-y-1 relative">
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
  );
}