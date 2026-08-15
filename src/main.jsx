import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const teams = [
  { name: "Team 1", color: "#1f66ff" },
  { name: "Team 2", color: "#4b8bff" },
  { name: "Team 3", color: "#7b5cff" },
  { name: "Team 4", color: "#ff5f8a" },
  { name: "Team 5", color: "#ff9a3c" },
  { name: "Team 6", color: "#20c997" },
  { name: "Team 7", color: "#ffd34d" },
  { name: "Team 8", color: "#ff6b6b" },
];

const rounds = [
  {
    title: "ROUND 1",
    category: "Cheffing It Up!",
    prompt: "Name something Revathi cooks better than anyone else.",
    answers: [
      { answer: "Alu Fry", points: 50 },
      { answer: "Enchiladas", points: 40 },
      { answer: "Pulihora", points: 30 },
      { answer: "Vankaya Pulusu/Koora", points: 20 },
      { answer: "Samosa Chaat", points: 10 },
      { answer: "Upma", points: 5 },
    ],
  },
  {
    title: "ROUND 2",
    category: "Signature Catchphrases",
    prompt: "If Revathi had an unexpected day to herself, what would she likely do?",
    answers: [
      { answer: "Go to the Zoo", points: 80 },
      { answer: "Go on a hike", points: 60 },
      { answer: "Try a new recipe (Cooking)", points: 40 },
      { answer: "Watch Mr. Monk (TV/Movie)", points: 30 },
      { answer: "Clean the house", points: 20 },
      { answer: "Sleep soundly", points: 10 },
    ],
  },
  {
    title: "ROUND 3",
    category: "Strict Timing",
    prompt: "Name something you'll likely find Revathi doing after work",
    answers: [
      { answer: "Has Coffee with Bread", points: 90 },
      { answer: "Yoga Class", points: 70 },
      { answer: "Temple", points: 50 },
      { answer: "On the phone with friends/family", points: 35 },
      { answer: "Going on a walk", points: 20 },
      { answer: "Continuing work (at home)", points: 10 },
    ],
  },
  {
    title: "ROUND 4",
    category: "Defining Qualities",
    prompt: "Name something that describes Revathi's character.",
    answers: [
      { answer: "Caring", points: 100 },
      { answer: "Good Storyteller", points: 80 },
      { answer: "Helpful", points: 60 },
      { answer: "Hardworking", points: 40 },
      { answer: "Giving", points: 30 },
      { answer: "Kind", points: 20 },
    ],
  },
];

const pairings = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],

function App() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [matchupIndex, setMatchupIndex] = useState(0);
  const [showBoard, setShowBoard] = useState(false);
  const [revealedSlots, setRevealedSlots] = useState([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const [awardedSlots, setAwardedSlots] = useState([]);
  const [scores, setScores] = useState(() =>
    Object.fromEntries(teams.map((team) => [team.name, 0])),
  );

  const currentRound = rounds[roundIndex];
  const [teamAIndex, teamBIndex] = pairings[matchupIndex % pairings.length];
  const teamA = teams[teamAIndex];
  const teamB = teams[teamBIndex];
  const totalSlides = 1 + rounds.length * 2;
  const boardAnswers = useMemo(() => currentRound.answers, [currentRound]);

  const activeSlide = useMemo(() => {
    if (slideIndex === 0) return { type: "intro" };

    const contentIndex = slideIndex - 1;
    const nextRound = Math.min(Math.floor(contentIndex / 2), rounds.length - 1);
    const isBoard = contentIndex % 2 === 1;

    return {
      type: isBoard ? "board" : "matchup",
      roundIndex: nextRound,
    };
  }, [slideIndex]);

  const syncToSlide = (nextSlideIndex) => {
    if (nextSlideIndex === 0) {
      setRoundIndex(0);
      setMatchupIndex(0);
      setShowBoard(false);
      setRevealedSlots([]);
      setActiveSlotIndex(null);
      setAwardedSlots([]);
      return;
    }

    const contentIndex = nextSlideIndex - 1;
    const nextRound = Math.min(Math.floor(contentIndex / 2), rounds.length - 1);
    const isBoard = contentIndex % 2 === 1;

    setRoundIndex(nextRound);
    setMatchupIndex(Math.min(nextRound, pairings.length - 1));
    setShowBoard(isBoard);
    setRevealedSlots([]);
    setActiveSlotIndex(null);
    setAwardedSlots([]);
  };

  const advanceSlide = () => {
    setSlideIndex((previous) => {
      const next = Math.min(previous + 1, totalSlides - 1);
      syncToSlide(next);
      return next;
    });
  };

  const retreatSlide = () => {
    setSlideIndex((previous) => {
      const next = Math.max(previous - 1, 0);
      syncToSlide(next);
      return next;
    });
  };

  const nextMatchup = () => {
    setMatchupIndex((previous) => (previous + 1) % pairings.length);
  };

  const previousMatchup = () => {
    setMatchupIndex((previous) =>
      previous === 0 ? pairings.length - 1 : previous - 1,
    );
  };

  const awardTeam = (teamName, points) => {
    setScores((previous) => ({
      ...previous,
      [teamName]: previous[teamName] + points,
    }));
  };

  const toggleSlot = (index) => {
    setRevealedSlots((previous) =>
      previous.includes(index)
        ? previous
        : [...previous, index],
    );
    setActiveSlotIndex(index);
  };

  const awardActiveSlot = (teamName) => {
    if (activeSlotIndex === null) return;
    if (awardedSlots.includes(activeSlotIndex)) return;

    const points = currentRound.answers[activeSlotIndex].points;

    awardTeam(teamName, points);
    setAwardedSlots((previous) => [...previous, activeSlotIndex]);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (key === "arrowright" || key === " ") {
        event.preventDefault();
        advanceSlide();
      }

      if (key === "arrowleft") retreatSlide();
      if (key === "a") nextMatchup();
      if (key === "z") previousMatchup();
      if (key === "f") setShowBoard((previous) => !previous);
      if (key === "1") awardTeam(teamA.name, currentRound.answers[0].points);
      if (key === "2") awardTeam(teamB.name, currentRound.answers[0].points);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="ff-shell">
      <div className="ff-bg-dots" />

      {activeSlide.type === "intro" && (
        <section className="ff-slide ff-intro">
          <div className="ff-logo">
            <div className="ff-logo-top">CLASSIC</div>
            <div className="ff-logo-family">Family</div>
            <div className="ff-logo-feud">FEUD</div>
          </div>
          <div className="ff-start-pill">Slideshow Mode</div>
        </section>
      )}

      {activeSlide.type !== "intro" && (
        <section className="ff-slide ff-game">
          <header className="ff-topbar">
            <div className="ff-round-label">
              {currentRound.title} · {currentRound.category}
            </div>
            <div className="ff-slide-counter">
              Slide {slideIndex + 1} / {totalSlides}
            </div>
          </header>

          <h2 className="ff-prompt">{currentRound.prompt}</h2>

          <section className="ff-matchup-strip" aria-label="Current matchup">
            <button
              type="button"
              className={`ff-team-card active ${activeSlotIndex !== null ? "can-award" : ""}`}
              style={{ borderColor: teamA.color }}
              onClick={() => awardActiveSlot(teamA.name)}
            >
              <span>Face Off</span>
              <strong>{teamA.name}</strong>
              <em>{scores[teamA.name]} pts</em>
              {activeSlotIndex !== null && <small>Click to award</small>}
            </button>
            <div className="ff-vs">VS</div>
            <button
              type="button"
              className={`ff-team-card active ${activeSlotIndex !== null ? "can-award" : ""}`}
              style={{ borderColor: teamB.color }}
              onClick={() => awardActiveSlot(teamB.name)}
            >
              <span>Face Off</span>
              <strong>{teamB.name}</strong>
              <em>{scores[teamB.name]} pts</em>
              {activeSlotIndex !== null && <small>Click to award</small>}
            </button>
          </section>

          <section className={`ff-board ${showBoard ? "is-open" : "is-closed"}`}>
            <div className="ff-board-frame">
              <div className="ff-board-grid">
                {boardAnswers.map((entry, index) => {
                  const isRevealed = revealedSlots.includes(index);

                  return (
                    <div
                      key={index}
                      className={`ff-answer-slot ${isRevealed ? "revealed" : "hidden"}`}
                      onClick={() => toggleSlot(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleSlot(index);
                        }
                      }}
                    >
                      <div className="ff-slot-number">{index + 1}</div>
                      <div className="ff-slot-body">
                        {isRevealed ? (
                          <div className="ff-slot-revealed-copy">
                            <strong>{entry.answer}</strong>
                            <span>{entry.points} points</span>
                              {awardedSlots.includes(index) && (
                                <small>Awarded</small>
                              )}
                          </div>
                        ) : (
                          <span className="ff-slot-hidden" />
                        )}
                      </div>
                      <div className="ff-slot-points">{entry.points}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <footer className="ff-footer">
            <div className="ff-team-roster">
              {teams.map((team, index) => {
                const isActive = index === teamAIndex || index === teamBIndex;

                return (
                  <div key={team.name} className={`ff-roster-pill ${isActive ? "active" : "muted"}`}>
                    <span className="ff-roster-color" style={{ background: team.color }} />
                    {team.name}
                  </div>
                );
              })}
            </div>

            <div className="ff-controls">
              <button onClick={retreatSlide}>Prev Slide</button>
              <button onClick={advanceSlide}>Next Slide</button>
              <button onClick={() => setShowBoard((previous) => !previous)}>
                Toggle Board
              </button>
            </div>
          </footer>
        </section>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
