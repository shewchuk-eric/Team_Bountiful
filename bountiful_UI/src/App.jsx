import { useEffect, useState } from "react";
import { getCharacters, getQuotes, getImages } from "./api/bomApi";


export default function App() {
  const [characters, setCharacters] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [view, setView] = useState("home");


  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); 
  const [qualityFilters, setQualityFilters] = useState({
    hero: true,
    zero: true,
    ambiguous: true,
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setStatus("");
      try {
        const [chars, qs, imgs] = await Promise.all([
          getCharacters(),
          getQuotes(),
          getImages(),
        ]);

        setCharacters(Array.isArray(chars) ? chars : []);
        setQuotes(Array.isArray(qs) ? qs : []);
        setImages(Array.isArray(imgs) ? imgs : []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong talking to the API.";
        setStatus(msg);
        /*
          AUTH will be here. eventually
        */
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const openCharacterModal = (character) => {
    setSelectedCharacter(character);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCharacter(null);
  };

  const getCharId = (c) => {
    if (!c) return null;
    if (typeof c._id === "string") return c._id;
    if (c._id && c._id.$oid) return c._id.$oid;
    return c.characterId || null;
  };

  let characterImages = [];
  let characterQuotes = [];

  if (selectedCharacter) {
    const id = getCharId(selectedCharacter);
    const name = selectedCharacter.characterName;

    characterImages = images.filter(
      (img) =>
        (id && img.characterId === id) ||
        (img.characterName && img.characterName === name)
    );

    characterQuotes = quotes.filter(
      (q) =>
        (id && q.characterId === id) ||
        (q.characterName && q.characterName === name)
    );
  }


  const visibleCharacters = [...characters]
    .sort((a, b) => {
      const nameA = (a.characterName || "").toLowerCase();
      const nameB = (b.characterName || "").toLowerCase();
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    })
    .filter((c) => {
      const name = (c.characterName || "").toLowerCase();
      const qualityKey = (c.quality || "").toLowerCase();
      const matchesSearch =
        !searchTerm || name.includes(searchTerm.toLowerCase());
      const matchesQuality =
        qualityFilters[qualityKey] === undefined
          ? true
          : qualityFilters[qualityKey];
      return matchesSearch && matchesQuality;
    });

  const toggleQualityFilter = (key) => {
    setQualityFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const goHome = () => setView("home");
  const goLogin = () => setView("login");
  const goSignup = () => setView("signup");

  return (
    <div className="bom-page">
      <header className="bom-header">
        <div className="bom-hero">
          <div className="bom-hero-overlay" />
          <div className="bom-hero-content">
            <div className="bom-hero-top-row">
              <div className="bom-hero-text">
                <h1 className="bom-title">
                  <span>Book of Mormon</span> Characters
                </h1>
                <p className="bom-subtitle">
                  Browse a record of people from the Book of Mormon. Select a
                  character to see related images and memorable quotes.
                </p>
              </div>

              <button
                className="bom-login-button"
                type="button"
                onClick={goLogin}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </header>


      {view === "home" && (
        <>
          {loading && <p className="bom-status">Loading sacred records…</p>}
          {!loading && status && <p className="bom-status">{status}</p>}
        </>
      )}

      <main className="bom-main">
        {view === "home" && (
          <>

            <div className="character-controls">
              <div className="character-controls-left">
                <div className="character-search">
                  <label className="character-search-label" htmlFor="search">
                    <span className="visually-hidden">Search characters</span>
                  </label>
                  <input
                    id="search"
                    className="character-search-input"
                    type="text"
                    placeholder="Search characters by name…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-wrapper">
                  <button
                    type="button"
                    className="filter-button"
                    onClick={() => setShowFilterPanel((v) => !v)}
                  >
                    Sort &amp; Filter ▾
                  </button>

                  {showFilterPanel && (
                    <div className="filter-panel">
                      <div className="filter-section">
                        <p className="filter-heading">Sort</p>
                        <label className="filter-row">
                          <input
                            type="checkbox"
                            checked={sortOrder === "asc"}
                            onChange={() => setSortOrder("asc")}
                          />
                          <span>A–Z</span>
                        </label>
                        <label className="filter-row">
                          <input
                            type="checkbox"
                            checked={sortOrder === "desc"}
                            onChange={() => setSortOrder("desc")}
                          />
                          <span>Z–A</span>
                        </label>
                      </div>

                      <div className="filter-section">
                        <p className="filter-heading">Quality</p>
                        <label className="filter-row">
                          <input
                            type="checkbox"
                            checked={qualityFilters.hero}
                            onChange={() => toggleQualityFilter("hero")}
                          />
                          <span>Hero</span>
                        </label>
                        <label className="filter-row">
                          <input
                            type="checkbox"
                            checked={qualityFilters.zero}
                            onChange={() => toggleQualityFilter("zero")}
                          />
                          <span>Zero</span>
                        </label>
                        <label className="filter-row">
                          <input
                            type="checkbox"
                            checked={qualityFilters.ambiguous}
                            onChange={() => toggleQualityFilter("ambiguous")}
                          />
                          <span>Ambiguous</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


            <section
              className="character-section"
              aria-label="Characters list"
            >
              <h2 className="section-title">Characters</h2>
              <p className="section-subtitle">
                Click on a character to see more details.
              </p>

              {visibleCharacters.length === 0 && !loading && (
                <p className="bom-muted">
                  No characters found. Try another search term or adjust your
                  filters.
                </p>
              )}

              <ul className="character-list">
                {visibleCharacters.map((c) => (
                  <li key={c._id || c.characterName} className="character-item">
                    <button
                      className="character-button"
                      onClick={() => openCharacterModal(c)}
                    >
                      <div className="character-name-row">
                        <span className="character-name">
                          {c.characterName}
                        </span>
                        <span className={`character-quality-chip ${c.quality.toLowerCase()}`}>
                          {c.quality}
                        </span>
                      </div>
                      <p className="character-meta">
                        First seen in{" "}
                        <strong>
                          {c.firstBookSeen} {c.firstVerseSeen}
                        </strong>
                      </p>
                      {c.notes && (
                        <p className="character-notes">{c.notes}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {view === "login" && (
          <AuthPage
            mode="login"
            onBack={goHome}
            onSwitch={goSignup}
          />
        )}

        {view === "signup" && (
          <AuthPage
            mode="signup"
            onBack={goHome}
            onSwitch={goLogin}
          />
        )}
      </main>

      <footer className="bom-footer">
        <p>
          Built for the <strong>Team Bountiful</strong> Book of Mormon
          Characters API project.
        </p>
        <p className="bom-footer-muted">
          Data served from{" "}
          <a
            href="https://team-bountiful.onrender.com/api-docs"
            target="_blank"
            rel="noreferrer"
          >
            team-bountiful.onrender.com
          </a>
        </p>
      </footer>

      {showModal && selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          images={characterImages}
          quotes={characterQuotes}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function CharacterModal({ character, images, quotes, onClose }) {
  const charName = character.characterName;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close details"
        >
          ✕
        </button>

        <h2 className="modal-title">{charName}</h2>

        <div className="modal-grid">
          <div className="modal-column">
            <h3 className="modal-subtitle">Details</h3>
            <p className="bom-label">First Seen</p>
            <p>
              {character.firstBookSeen} {character.firstVerseSeen}
            </p>

            <p className="bom-label">Quality</p>
            <p>
              <span className="bom-chip">
                <span>●</span> {character.quality}
              </span>
            </p>

            {character.notes && (
              <>
                <p className="bom-label" style={{ marginTop: "0.75rem" }}>
                  Notes
                </p>
                <p className="bom-muted">{character.notes}</p>
              </>
            )}
          </div>

          <div className="modal-column">
            <div className="modal-section">
              <h3 id="modal-images-title" className="modal-subtitle">
                Images
              </h3>
              {images.length === 0 && (
                <p className="bom-muted">
                  No images found for this character.
                </p>
              )}

              <div className="modal-images">
                {images.map((img) => (
                  <figure
                    key={img._id || img.filename}
                    className="modal-image-card"
                  >
                    {img.source && (
                      <img
                        className="modal-image"
                        src={img.source}
                        alt={img.caption || `${charName} image`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <figcaption>
                      <p>{img.caption}</p>
                      {img.source && (
                        <p className="bom-muted">
                          <a
                            href={img.source}
                            className="bom-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View source
                          </a>
                        </p>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>


        <div className="modal-quotes-section">
          <h3 className="modal-subtitle">Quotes</h3>
          {quotes.length === 0 && (
            <p className="bom-muted">No quotes found for this character.</p>
          )}

          <ul className="modal-quotes">
            {quotes.map((q) => (
              <li key={q._id || q.text} className="modal-quote-item">
                <p className="bom-quote">“{q.text}”</p>
                <p className="bom-muted">
                  {q.bookName} {q.verse}
                  {q.characterQuality ? ` — ${q.characterQuality}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}



function AuthPage({ mode, onBack, onSwitch }) {
  const isLogin = mode === "login";

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Auth will be connected to the API later.");
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <button type="button" className="auth-back-link" onClick={onBack}>
          ← Back to characters
        </button>
        <h2 className="auth-title">{isLogin ? "Log In" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </label>

          <button type="submit" className="auth-submit">
            {isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={onSwitch}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={onSwitch}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
