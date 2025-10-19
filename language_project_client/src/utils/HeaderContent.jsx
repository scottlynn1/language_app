import React from "react";

export default function HeaderContent() {
return (
  <>
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
      <br/>
      <br/>
      It should also be mentioned that this game adaptation for language excersice is best suited for someone with an intermediate or higher level grasp of the language they are learning.
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
  </>
)}