import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import natural from "natural";
const stemmer = natural.PorterStemmerEs;
const word_bank = JSON.parse(fs.readFileSync('./word_bank.json', 'utf-8'));

const LAX_GAUGE = .85
dotenv.config();
const app = express();
app.use(cors());
const redis = new Redis(process.env.REDIS_URL); // connect to Redis Cloud or local

// Middleware to parse JSON request bodies
app.use(express.json());
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({});

app.post("/new-word", async (req, res) => {
  try {
    // was using ai previously for word generation
    // const response = await ai.models.generateContent({
    //   model: "gemini-2.5-flash",
    //   contents: `Generate one random but highschool level English noun or verb. 
    //                    Provide exactly 3 of its Spanish translations (synonyms or equivalents).
    //                    Return your answer just like this:
    //                    { "english": "...", "spanish": ["...", "...", "..."] }`,
    //   generationConfig: {
    //     responseMimeType: "application/json",
    //     responseSchema: '{ "english": "...", "spanish": ["...", "...", "..."] }'
    //   }
    // });

    // const raw = response.text;
    // const cleaned = raw.replace(/```json\n?/, "").replace(/```$/, "").trim();
    // const data = JSON.parse(cleaned);
    const { difficulty } = req.body;
    const level = difficulty || 'advanced';
    const gameId = uuidv4();
    const wordData = getRandomWord(level)
    const gameData = {
      wordData,
      hints: [],
      guesses: [],
      status: "in_progress"
    };

    try {
      await redis.set(`game:${gameId}`, JSON.stringify(gameData), "EX", 3600);
    } catch (err) {
      return res.status(500).json({ error: err });
    }

    return res.json({ english: wordData.english, synonyms: wordData.synonyms, gameId}); // hide Spanish answers
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch from Gemini" });
  }
});

// 2. Guess the Spanish word from hints
app.post("/guess", async (req, res) => {
  const { currentHint, gameId } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: "No active game. Start a new round first." });
  }

  const gameRaw = await redis.get(`game:${gameId}`);
  if (!gameRaw) {
    return res.status(404).json({ error: "Game not found or expired" });
  }
  const gameData = JSON.parse(gameRaw);

  // const hint_array = currentHint.toLowerCase().split(" ");
  // const synonyms = [...gameData.wordData.spanish, ...gameData.wordData.synonyms];

  // if (validateHint(hint_array, synonyms)) {
  //   return res.status(400).json({ error: "Your hint includes a word too close to the answer." });
  // }
  
  
  const chathistory = constructHistory(gameData.hints, gameData.guesses)
  const chathistoryandcontext = [
    {
      role: 'user',
      parts: [
        { text: 
          `You are playing a Spanish word guessing game. 
          Based on the hints provided by the user, respond with **exactly one correct Spanish translation or equivalent** for the English word. 
          Some valid answers may be multiple words (like 'de sobra'). 
          Do NOT provide explanations, punctuation, or commentary. Only respond with the answer.
          The word in this round is going to be a ${gameData.wordData.partOfSpeech}`,
        }
      ]
    },
    {
      role: 'model',
      parts: [
        { text: 
          "Sounds fun. I'll give it a try"
        }
      ]
    },
    ...chathistory
  ]
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
      history: chathistoryandcontext
    });
    
    const response = await chat.sendMessage({
      message: currentHint,
    });
    
    let guess = response.text;
    
    const embed_guess = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: [
        `${guess}`
      ],
    });
    
    const embed_ans = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: [
        `${gameData.wordData.spanish}`
      ],
    });
    
    const guess_vector = embed_guess.embeddings[0].values;
    const ans_vector = embed_ans.embeddings[0].values;
    
    const similarity = cosineSimilarity(guess_vector, ans_vector);
    console.log(similarity)
    
    const correct = similarity > LAX_GAUGE ? true : false
    
    // was using exact matching before, but switches to comparing vector embeddings to catch all similar words in meaning
    // const correct = gameData.wordData.spanish.some(
      //   (w) => w.toLowerCase() === guess.toLowerCase()
      // );
      if (!correct) {
        gameData.hints.push(currentHint);
        gameData.guesses.push(guess);
        await redis.set(`game:${gameId}`, JSON.stringify(gameData), "EX", 3600);
      }
      
      return res.json({ guess, correct });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch from Gemini" });
    }
  });
  
  function constructHistory(hints, guesses) {
    let history = []
    for (let i = 0; i < hints.length; i++) {
      history.push(
        {
          role: "user",
        parts: [{ text: `${hints[i]}` }],
      },
      {
        role: "model",
        parts: [{ text: `${guesses[i]}` }],
      },
    )
  };
  return history;
}

function getRandomWord(level = 'advanced') {
  const words = word_bank[level];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

function validateHint(hint, words) {
  const hint_stems = hint.map(w => stemmer.stem(w));
  console.log(hint_stems);
  const word_stems = words.map(w => stemmer.stem(w));
  console.log(word_stems);
  return words.some(w => hint_stems.includes(w => word_stems));
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});