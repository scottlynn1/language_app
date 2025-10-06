import React, { useState } from "react";
import ProgressBar from './utils/ProgressBar';
import Modal from './utils/Modal';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function WordGuessGame() {
  const [word, setWord] = useState("");
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
    setIsloadingword(true);
    setSimilarwords([]);
    setHints([]);
    setAiGuesses([]);
    setTries(3);
    setSuccess(false);
    setFail(false);
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
    <div className="w-full max-w-md bg-gray-400 rounded-xl shadow-lg p-6">
      <h1 className="text-xl font-bold mb-2">In Other Words</h1>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <button onClick={startNewGame}>Beginner</button>
        <button onClick={startNewGame}>Intermediate</button>
        <button onClick={startNewGame}>Advanced</button>
        <button onClick={startNewGame}>Expert</button>
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
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Start New Game
      </button>
      {/* <button
        onClick={newWord}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        New Word
      </button> */}
      <div className="flex justify-between">
        <div className="mb-4">
        <span className="mb-4 font-bold">Word: </span>
        { isloadingword ?
          <span className='loader'>
            <span></span>
            <span></span>
            <span></span>
          </span> : <strong>{word}</strong>
        }
        </div>
        <div>
        { success && (
          <p className="text-green-600 font-bold">Guessed correctly!</p>
        )}
        
        { fail ? (
          <p className="text-red-600 font-bold">All out of attempts!</p>
        ) : (
          <p className="font-bold">Attempts Left: {tries}</p>
        )}
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-4">Forbidden Words: </span>
        <span>{similarwords.join(', ')}</span>
      </div>

      <div className="mb-4 space-y-2">
        <input
        type="text"
        placeholder="Write a hint in Spanish..."
        value={currentHint}
        onChange={(e) => setCurrentHint(e.target.value)}
        className="w-full p-2 border rounded-md"
        />
        {!success && !fail && (
          <button
          onClick={aiMakeGuess}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
          Try this hint
          </button>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Hints Provided:</h3>
        <ul className="list-disc list-inside text-gray-700">
        {hints.map((h, idx) => (
          <li key={idx}>{h}</li>
        ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Guesses:</h3>
        <ul className="list-disc list-inside text-gray-700">
        {aiGuesses.map((g, idx) => (
            <li key={idx}>{g}</li>
          ))}
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
  );
}