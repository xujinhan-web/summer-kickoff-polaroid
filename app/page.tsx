"use client";
/* eslint-disable @next/next/no-img-element */

import { ArrowLeft, Camera, Download, Plus, RefreshCw, Share2, Sparkles, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { type RefObject, useMemo, useRef, useState } from "react";

type Screen = "landing" | "studio";

const fallbackPlayers = ["Alex", "Leo", "Jordan", "Mika"];

const posterImages = [
  "https://free.picui.cn/free/2026/06/22/6a3871a1aa988.jpg",
  "https://free.picui.cn/free/2026/06/22/6a3871a1bbcbd.jpg",
  "https://free.picui.cn/free/2026/06/22/6a3871a1a99b1.jpg",
  "https://free.picui.cn/free/2026/06/22/6a3871a1c3061.jpg",
  "https://free.picui.cn/free/2026/06/22/6a3871a1b8606.jpg",
  "https://free.picui.cn/free/2026/06/22/6a38725087a9d.jpg",
  "https://free.picui.cn/free/2026/06/22/6a3872506166f.jpg",
  "https://free.picui.cn/free/2026/06/22/6a38725076a78.jpg",
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [names, setNames] = useState(["", "", ""]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const posterRef = useRef<HTMLDivElement>(null);

  const activeNames = useMemo(() => names.map((name) => name.trim()), [names]);

  const updateName = (index: number, value: string) => {
    setNames((current) => current.map((name, i) => (i === index ? value : name)));
  };

  const addPlayer = () => {
    if (names.length < 4) {
      setNames((current) => [...current, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (names.length > 3) {
      setNames((current) => current.filter((_, i) => i !== index));
    }
  };

  const generatePoster = () => {
    setIsGenerating(true);
    setError("");

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * posterImages.length);
      setGeneratedImage(posterImages[randomIndex]);
      setIsGenerating(false);
    }, 1000);
  };

  const downloadPoster = async () => {
    if (!posterRef.current) return;
    setError("");

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#fff8e9",
      });
      const link = document.createElement("a");
      link.download = "summer-kickoff-poster.png";
      link.href = dataUrl;
      link.click();
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : "Could not download the poster.";
      setError(message);
    }
  };

  return (
    <main className="page-shell">
      <section className="phone-frame" aria-label="Summer Kickoff Poster Studio">
        {screen === "landing" ? (
          <LandingScreen onCreate={() => setScreen("studio")} />
        ) : (
          <StudioScreen
            activeNames={activeNames}
            error={error}
            generatedImage={generatedImage}
            isGenerating={isGenerating}
            names={names}
            onAddPlayer={addPlayer}
            onBack={() => setScreen("landing")}
            onDownload={downloadPoster}
            onGenerate={generatePoster}
            onRemovePlayer={removePlayer}
            onUpdateName={updateName}
            posterRef={posterRef}
          />
        )}
      </section>
    </main>
  );
}

function LandingScreen({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="landing-screen">
      <div className="landing-art" />
      <div className="landing-wash" />
      <div className="landing-content">
        <p className="est">EST. 2026</p>
        <div className="ball-medallion" aria-hidden="true">⚽</div>
        <h1>Summer<br />Kickoff</h1>
        <p className="landing-copy">Create your World Cup<br />team memory with friends!</p>
      </div>
      <button className="floating-create" onClick={onCreate} type="button">
        <Camera size={16} />
        Let&apos;s start
      </button>
      <p className="footer-note">© 2026 Summer of Soccer</p>
    </div>
  );
}

function StudioScreen({
  activeNames,
  error,
  generatedImage,
  isGenerating,
  names,
  onAddPlayer,
  onBack,
  onDownload,
  onGenerate,
  onRemovePlayer,
  onUpdateName,
  posterRef,
}: {
  activeNames: string[];
  error: string;
  generatedImage: string | null;
  isGenerating: boolean;
  names: string[];
  onAddPlayer: () => void;
  onBack: () => void;
  onDownload: () => void;
  onGenerate: () => void;
  onRemovePlayer: (index: number) => void;
  onUpdateName: (index: number, value: string) => void;
  posterRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className="studio-screen">
      <header className="studio-header">
        <button className="round-button" onClick={onBack} aria-label="Back" type="button"><ArrowLeft size={18} /></button>
        <strong>Poster Studio</strong>
        <button className="round-button" aria-label="Share" type="button"><Share2 size={17} /></button>
      </header>

      <section className="player-card" aria-label="Team players">
        <p>Team Players</p>
        {names.map((name, index) => (
          <label className="name-row" key={index}>
            <input
              maxLength={18}
              onChange={(event) => onUpdateName(index, event.target.value)}
              placeholder="...waiting you"
              value={name}
            />
            <Sparkles className={`star star-${index + 1}`} size={14} />
            {names.length > 3 && index === names.length - 1 ? (
              <button className="remove-player" onClick={() => onRemovePlayer(index)} type="button" aria-label="Remove player">
                <Trash2 size={13} />
              </button>
            ) : null}
          </label>
        ))}
        {names.length < 4 ? (
          <button className="add-player" onClick={onAddPlayer} type="button"><Plus size={14} /> Add fourth player</button>
        ) : null}
      </section>

      <button className="create-poster-btn" disabled={isGenerating} onClick={onGenerate} type="button">
        <RefreshCw className={isGenerating ? "spin" : ""} size={15} />
        {isGenerating ? "Creating..." : "Create Poster"}
      </button>

      <PosterCard activeNames={activeNames} generatedImage={generatedImage} posterRef={posterRef} />

      {error ? <p className="error-message">{error}</p> : null}

      <div className="actions">
        <button className="primary-action" onClick={onDownload} type="button">
          <Download size={15} />
          Save Poster PNG
        </button>
      </div>
    </div>
  );
}

function PosterCard({
  activeNames,
  generatedImage,
  posterRef,
}: {
  activeNames: string[];
  generatedImage: string | null;
  posterRef: RefObject<HTMLDivElement>;
}) {
  if (!generatedImage) {
    return (
      <div className="polaroid" ref={posterRef}>
        <div className="tape" />
        <div className="poster-art-wrap">
          <div className="empty-state">
            <p>Press Create Poster</p>
          </div>
        </div>
        <p className="poster-caption">summer kickoff memory</p>
      </div>
    );
  }

  return (
    <div className="polaroid" ref={posterRef}>
      <div className="tape" />
      <div className="poster-art-wrap">
        <img alt="Generated chibi football illustration" className="poster-art" src={generatedImage} referrerPolicy="no-referrer" />
        <div className="name-labels">
          {activeNames.map((name, index) => {
            const hasName = Boolean(name);
            return (
              <span className={`paper-name paper-${index + 1} ${hasName ? "" : "empty"}`} key={index}>
                {hasName ? name : fallbackPlayers[index]}
              </span>
            );
          })}
        </div>
      </div>
      <p className="poster-caption">summer kickoff memory</p>
    </div>
  );
}
