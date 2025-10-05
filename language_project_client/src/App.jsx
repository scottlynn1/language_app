import React, { useState } from "react";
import ProgressBar from './utils/ProgressBar'

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
  const [isloading, setIsloading] = useState(false);

  const startNewRound = async () => {
    setIsloading(true);
    setWord("");
    setSimilarwords([]);
    setHints([]);
    setAiGuesses([]);
    setTries(3);
    setSuccess(false);
    setFail(false);
    try {
      const res = await fetch("http://localhost:3000/new-word");
      if (!res.ok) throw new Error(`server error: ${res.status}`)
      const data = await res.json();
      setIsloading(false);
      setWord(data.english);
      setSimilarwords([...data.synonyms]);
      setGameId(data.gameId);
    } catch (err) {
      setIsloading(false);
      console.log(err)
    }
  };

  const addHint = () => {
    if (!currentHint.trim()) return;
    setHints([...hints, currentHint]);
    setCurrentHint("");
  };

  const aiMakeGuess = async () => {
    addHint();
    if (!currentHint.trim()) return;
    const res = await fetch("http://localhost:3000/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHint: currentHint.trim(), gameId }),
    });
    const data = await res.json();
    setAiGuesses([...aiGuesses, data.guess]);
    if (data.correct) {
      setSuccess(true);
      setProgress(progress + 100)
    }
    else setTries(tries - 1);
    if (tries < 2) setFail(true)
  };


return (
  <div className="flex flex-col items-center min-h-screen bg-gray-500 p-6">
    <div className="w-full max-w-md bg-gray-400 rounded-xl shadow-lg p-6">
      <h1 className="text-xl font-bold mb-2">Game: In Other Words</h1>
      <ProgressBar
        value={progress}
        max={1000}
        animated
        />
      <button
        onClick={startNewRound}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        New Round
      </button>
      <div className="flex justify-between">
        <div className="mb-4">
        <span className="mb-4 font-bold">Word: </span>
        { isloading ?
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
          Ask AI to Guess
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
        <h3 className="font-semibold">AI Guesses:</h3>
        <ul className="list-disc list-inside text-gray-700">
        {aiGuesses.map((g, idx) => (
        <li key={idx}>{g}</li>
      ))}
        </ul>
      </div>



    </div>
  </div>
  );
}