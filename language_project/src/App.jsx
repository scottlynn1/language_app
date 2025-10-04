import React, { useState } from "react";
import ProgressBar from './utils/ProgressBar'

export default function WordGuessGame() {
  const [englishWord, setEnglishWord] = useState(null);
  const [hints, setHints] = useState([]);
  const [currentHint, setCurrentHint] = useState("");
  const [aiGuesses, setAiGuesses] = useState([]);
  const [success, setSuccess] = useState(false);
  const [tries, setTries] = useState(3);
  const [fail, setFail] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gameId, setGameId] = useState(null);

  const startNewRound = async () => {
    const res = await fetch("http://localhost:3000/new-word");
    const data = await res.json();
    setEnglishWord(data.english);
    setHints([]);
    setAiGuesses([]);
    setTries(3);
    setSuccess(false);
    setFail(false);
    setGameId(data.gameId);
  };

  const addHint = () => {
    if (!currentHint.trim()) return;
    setHints([...hints, currentHint]);
    setCurrentHint("");
  };

  const aiMakeGuess = async () => {
    const res = await fetch("http://localhost:3000/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hints, gameId }),
    });
    const data = await res.json();
    setAiGuesses([...aiGuesses, data.guess]);
    if (data.correct) {
      setSuccess(true);
      setProgress(progress + 100)
    }
    else setTries(tries - 1);
    if (!tries) setFail(true)
  };


return (
  <div className="flex flex-col items-center min-h-screen bg-gray-500 p-6">
    <div className="w-full max-w-md bg-gray-400 rounded-xl shadow-lg p-6">
      <h1 className="text-xl font-bold mb-2">AI Word Guessing Game</h1>
      <ProgressBar
        value={progress}
        max={1000}
        animated
        striped
      />
      <p className="mb-4">English Word: <strong>{englishWord}</strong></p>
      <button
        onClick={startNewRound}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        New Round
      </button>

      <div className="mb-4 space-y-2">
        <input
        type="text"
        placeholder="Write a hint in Spanish..."
        value={currentHint}
        onChange={(e) => setCurrentHint(e.target.value)}
        className="w-full p-2 border rounded-md"
        />
        <button
        onClick={addHint}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
        Add Hint
        </button>
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


      {!success && !fail && (
        <button
        onClick={aiMakeGuess}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
        >
        Ask AI to Guess
        </button>
      )}
      { success && (
        <p className="text-green-600 font-bold">AI guessed correctly!</p>
      )}

      { fail ? (
        <p className="text-red-600 font-bold">All out of attempts!</p>
      ) : (
        <p className="text-green-600 font-bold">{tries}</p>
      )}

    </div>
  </div>
  );
}