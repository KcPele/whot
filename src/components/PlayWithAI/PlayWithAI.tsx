import React, { useState, useRef, useEffect } from "react";
import styles from "./playWithAI.module.css";

const AI_MODELS = [
  "Open AI",
  "Claude",
  "Gemini",
  "Grok",
  "Kimi k2"
];

const PlayWithAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setIsOpen(false);
    setShowModal(true);
  };

  return (
    <>
      <div className={styles.container} ref={dropdownRef}>
        <button 
          className={styles.mainButton} 
          onClick={() => setIsOpen(!isOpen)}
        >
          PLAY AI
        </button>
        
        {isOpen && (
          <div className={styles.dropdown}>
            {AI_MODELS.map((model) => (
              <button 
                key={model} 
                onClick={() => handleModelSelect(model)}
              >
                {model}
              </button>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Coming Soon!</h3>
            <p>
              Integration with <strong>{selectedModel}</strong> is currently under development. 
              Stay tuned for updates!
            </p>
            <button 
              className={styles.closeButton}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayWithAI;
