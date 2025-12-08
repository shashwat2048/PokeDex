import { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard";
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { FcSearch } from "react-icons/fc";
import PokemonModal from "./PokemonModal";
import logoimg from "../assets/pokeball.png";
import { MdMusicNote, MdMusicOff, MdLightMode, MdDarkMode, MdFavorite, MdFavoriteBorder, MdHome, MdFileDownload } from "react-icons/md";
import bgMusic from "../assets/bgMusic.mp3";
import LoaderCard from "./LoaderCard";
import { useLocalStorage } from "../hooks/useLocalStorage";


export default function PokemonData() {
  const [allPokemonData, setallPokemonData] = useState([]);
  const [pokeData, setPokeData] = useState([]);
  const API = "https://pokeapi.co/api/v2/pokemon?limit=1302&offset=0";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currPage, setCurrPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const pageSize = 12;
  const [music] = useState(new Audio(bgMusic));
  const [isBgPlaying, setIsBgPlaying] = useLocalStorage('pokedex-music-playing', false);
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('pokedex-dark-theme', false);
  const [favorites, setFavorites] = useLocalStorage('pokedex-favorites', []);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const typeColors = {
    normal: 'bg-[#A8A77A]',
    fire: 'bg-[#EE8130]',
    water: 'bg-[#6390F0]',
    electric: 'bg-[#F7D02C]',
    grass: 'bg-[#7AC74C]',
    ice: 'bg-[#96D9D6]',
    fighting: 'bg-[#C22E28]',
    poison: 'bg-[#A33EA1]',
    ground: 'bg-[#E2BF65]',
    flying: 'bg-[#A98FF3]',
    psychic: 'bg-[#F95587]',
    bug: 'bg-[#A6B91A]',
    rock: 'bg-[#B6A136]',
    ghost: 'bg-[#735797]',
    dragon: 'bg-[#6F35FC]',
    dark: 'bg-[#705746]',
    steel: 'bg-[#B7B7CE]',
    fairy: 'bg-[#D685AD]',
    stellar: 'bg-[#FFD700]',
    };
    
  const fetchAllPokemons = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setallPokemonData(data.results);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPokemonDetails = async () => {
    if (allPokemonData.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      let pokemonsTofetch = allPokemonData;
      
      // Filter by search
      if (search) {
        pokemonsTofetch = allPokemonData.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      } 
      // Filter by favorites only
      else if (showFavoritesOnly) {
        pokemonsTofetch = allPokemonData.filter(p => {
          const pokemonId = parseInt(p.url.split('/').filter(Boolean).pop());
          return favorites.includes(pokemonId);
        });
        // Apply pagination to favorites
        const offset = (currPage - 1) * pageSize;
        pokemonsTofetch = pokemonsTofetch.slice(offset, offset + pageSize);
      } 
      // Pagination for normal view
      else {
        const offset = (currPage - 1) * pageSize;
        pokemonsTofetch = allPokemonData.slice(offset, offset + pageSize);
      }
      
      const details = await Promise.all(
        pokemonsTofetch.map(async p => {
          const r = await fetch(p.url);
          return r.json();
        })
      );
      if(details.length > 0){
        setPokeData(details);
      } else {
        setPokeData([]);
      } 
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPokemons();
  }, []);

  useEffect(() => {
    fetchPokemonDetails();
  }, [allPokemonData, currPage, search, showFavoritesOnly]);

  // No need for separate favorites effect - we handle it optimistically in toggleFavorite

  const totalpokeCard = search
    ? allPokemonData.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ).length
    : showFavoritesOnly
    ? favorites.length
    : allPokemonData.length;
  const totalPages = Math.ceil(totalpokeCard / pageSize);

  const handlePrev = () => {
    if (currPage > 1) setCurrPage(prev => prev - 1);
  };
  const handleNext = () => {
    if (currPage < totalPages) setCurrPage(prev => prev + 1);
  };
  function closeModal(audioref) {
    const audio = new Audio(audioref);
    audio.volume = 0.5;
    audio.currentTime = 0.2;
    audio.play();
    setSelected(null);
  }

  function openModal(pokemon, audioref) {
    const audio = new Audio(audioref);
    audio.volume = 0.5;
    audio.currentTime = 0.2;
    audio.play();
    setSelected(pokemon);
  }

  const goHome = () =>{
    setSearch("");
    setCurrPage(1);
    setShowFavoritesOnly(false);
  }

  const toggleFavoritesView = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setSearch("");
    setCurrPage(1);
  }


  const handleBgMusic = () => {
    music.loop = true;
    music.volume = 0.1;
    if (isBgPlaying) {
        music.pause();
        setIsBgPlaying(false);
    } else {
        music.play().catch((err) => console.error("Error playing audio:", err));
        setIsBgPlaying(true);
    }
    showPreferenceSavedToast();
  }

  const handleThemeToggle = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showPreferenceSavedToast();
  }

  const showPreferenceSavedToast = (message = 'Preference saved!') => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  const toggleFavorite = (pokemonId, event) => {
    // Prevent any default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const isFavorite = favorites.includes(pokemonId);
    
    if (isFavorite) {
      showPreferenceSavedToast('Removed from favorites');
      setFavorites(prev => prev.filter(id => id !== pokemonId));
      
      // If viewing favorites, immediately remove from display (optimistic update)
      if (showFavoritesOnly) {
        setPokeData(prev => prev.filter(p => p.id !== pokemonId));
      }
    } else {
      showPreferenceSavedToast('Added to favorites!');
      setFavorites(prev => [...prev, pokemonId]);
    }
  }

  const isFavorite = (pokemonId) => {
    return favorites.includes(pokemonId);
  }

  const exportFavoritesAsCSV = () => {
    if (favorites.length === 0) {
      showPreferenceSavedToast('No favorites to export');
      return;
    }

    // Get all favorited Pokemon from current data
    const favoritePokemon = allPokemonData
      .filter(p => {
        const pokemonId = parseInt(p.url.split('/').filter(Boolean).pop());
        return favorites.includes(pokemonId);
      })
      .map(p => {
        const pokemonId = parseInt(p.url.split('/').filter(Boolean).pop());
        return {
          id: pokemonId,
          name: p.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
          url: `${window.location.origin}${window.location.pathname}#${pokemonId}`
        };
      });

    // Create CSV content
    const headers = ['ID', 'Name', 'Image URL', 'Pokédex Link'];
    const csvRows = [
      headers.join(','),
      ...favoritePokemon.map(pokemon => 
        `${pokemon.id},"${pokemon.name}","${pokemon.image}","${pokemon.url}"`
      )
    ];
    const csvContent = csvRows.join('\n');

    // Create downloadable file
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pokedex-favorites-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showPreferenceSavedToast('Favorites exported as CSV!');
  }

  // Initialize theme on mount from localStorage
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle music state on mount - note: browsers block autoplay
  useEffect(() => {
    music.loop = true;
    music.volume = 0.1;
    
    // Note: Browsers block autoplay, so we only try if user previously enabled it
    // User will need to click the button once after page load due to browser restrictions
    if (isBgPlaying) {
      // Attempt to play, but it will likely be blocked until user interaction
      const playPromise = music.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, reset state
          setIsBgPlaying(false);
        });
      }
    }
    
    // Cleanup
    return () => {
      music.pause();
    };
  }, []);

  return (
    <section 
      className="container mx-auto px-2 sm:px-4 py-8 min-h-screen transition-colors duration-300 flex flex-col"
      aria-label="Pokédex application"
    >
      <header 
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0 sticky top-0 p-2 z-20 bg-[#d4eeff] dark:bg-[#1e293b] transition-colors duration-300 shadow-sm"
        role="banner"
      >
        <div 
          onClick={goHome} 
          className="flex flex-row gap-3 items-center cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goHome(); }}
          aria-label="Go to home page - reset search and pagination"
        >
          <img src={logoimg} alt="Pokéball logo" className="w-12 h-12" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center sm:text-left text-gray-900 dark:text-white">
        Pokédex Swift
        </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:space-x-4 w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2 self-center" role="group" aria-label="Settings controls">
                <button 
                    onClick={goHome}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Go to home page"
                    title="Home"
                >
                    <MdHome className="text-xl text-gray-700 dark:text-gray-300" aria-hidden="true" />
                </button>
                <button 
                    onClick={toggleFavoritesView}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                    aria-label={showFavoritesOnly ? "Show all Pokémon" : `Show favorites (${favorites.length})`}
                    aria-pressed={showFavoritesOnly}
                    title={showFavoritesOnly ? "Show all" : `Favorites (${favorites.length})`}
                >
                    {showFavoritesOnly ? 
                      <MdFavorite className="text-red-500 text-xl" aria-hidden="true" /> : 
                      <MdFavoriteBorder className="text-gray-700 dark:text-gray-300 text-xl" aria-hidden="true" />
                    }
                    {favorites.length > 0 && !showFavoritesOnly && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {favorites.length > 99 ? '99+' : favorites.length}
                      </span>
                    )}
                </button>
                {showFavoritesOnly && favorites.length > 0 && (
                  <button 
                      onClick={exportFavoritesAsCSV}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      aria-label="Export favorites as CSV"
                      title="Export favorites as CSV (Excel/Sheets)"
                  >
                      <MdFileDownload className="text-xl text-gray-700 dark:text-gray-300" aria-hidden="true" />
                  </button>
                )}
                <button 
                    onClick={handleThemeToggle} 
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
                    aria-pressed={isDarkTheme}
                    title={isDarkTheme ? "Light mode" : "Dark mode"}
                >
                    {isDarkTheme ? 
                      <MdLightMode className="text-yellow-400 text-xl" aria-hidden="true" /> : 
                      <MdDarkMode className="text-gray-700 text-xl" aria-hidden="true" />
                    }
                </button>
                <button 
                    onClick={handleBgMusic} 
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label={isBgPlaying ? "Pause background music" : "Play background music"}
                    aria-pressed={isBgPlaying}
                    title={isBgPlaying ? "Music playing" : "Music paused"}
                >
                    {isBgPlaying ? 
                      <MdMusicNote className="text-xl text-gray-900 dark:text-white" aria-hidden="true" /> : 
                      <MdMusicOff className="text-xl text-gray-900 dark:text-white" aria-hidden="true" />
                    }
            </button>
            </div>
          <div className="relative text-gray-400 focus-within:text-gray-600 flex-1 sm:flex-none" role="search">
            <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg" aria-hidden="true" />
            <label htmlFor="pokemon-search" className="sr-only">Search Pokémon by name</label>
            <input
              id="pokemon-search"
              type="search"
              placeholder="Search Pokémon..."
              onClick={e => e.target.placeholder = "Gotta Catch 'em All!"}
              value={search}
              onChange={e => {
                e.target.placeholder = "Search Pokémon...";
                setSearch(e.target.value);
                setCurrPage(1);
              }}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm rounded-tl-lg rounded-br-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              aria-describedby="search-description"
              aria-controls="pokemon-grid"
            />
            <span id="search-description" className="sr-only">
              Search through {allPokemonData.length} Pokémon by name
            </span>
          </div>
          {!search && (
            <nav 
              className="flex justify-center sm:justify-start items-center space-x-2 mt-2 sm:mt-0"
              role="navigation"
              aria-label="Pagination navigation"
            >
              <button
                onClick={handlePrev}
                disabled={currPage === 1}
                className="flex items-center justify-center px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded disabled:opacity-50 text-sm rounded-tl-lg rounded-br-lg"
                aria-label={`Go to previous page, page ${currPage - 1}`}
                aria-disabled={currPage === 1}
                title="Previous page"
              >
                <AiOutlineLeft aria-hidden="true" />
                <span className="sr-only">Previous</span>
              </button>
              <span 
                className="text-sm text-gray-900 dark:text-white"
                aria-live="polite"
                aria-atomic="true"
                role="status"
              >
                Page {currPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currPage === totalPages}
                className="flex items-center justify-center px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded disabled:opacity-50 text-sm rounded-bl-lg rounded-tr-lg"
                aria-label={`Go to next page, page ${currPage + 1}`}
                aria-disabled={currPage === totalPages}
                title="Next page"
              >
                <AiOutlineRight aria-hidden="true" />
                <span className="sr-only">Next</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {error && (
        <div 
          role="alert" 
          className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Failed to load Pokémon data. Please try again.</span>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {loading ? `Loading Pokémon data` : `Showing ${pokeData.length} Pokémon${showFavoritesOnly ? ' favorites' : search ? ` matching "${search}"` : ` on page ${currPage}`}`}
      </div>

      <div className="flex-grow">
        <ul 
          id="pokemon-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          role="list"
          aria-label={search ? `Search results for ${search}` : `Pokémon list page ${currPage}`}
        >
        {
          loading 
          && 
          Array(pageSize).fill(0).map((_, idx)=>{
          return(
          <LoaderCard key={idx}/>
          )
          })
        }

        {
            !loading && pokeData.length === 0 && search && (
              <li className="col-span-full text-center py-12">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  No Pokémon found matching "{search}"
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Clear search and show all Pokémon"
                >
                  Clear Search
                </button>
              </li>
            )
          }

          {
            !loading && pokeData.length === 0 && showFavoritesOnly && (
              <li className="col-span-full text-center py-12">
                <div className="flex flex-col items-center">
                  <MdFavoriteBorder className="text-6xl text-gray-400 dark:text-gray-600 mb-4" aria-hidden="true" />
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                    No favorites yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Click the heart icon on any Pokémon card to add it to your favorites!
                  </p>
                  <button
                    onClick={toggleFavoritesView}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Show all Pokémon"
                  >
                    Browse Pokémon
                  </button>
                </div>
              </li>
            )
          }

        {
          !loading && pokeData.map(pokemon => (
            <PokemonCard 
              key={pokemon.id} 
              pokemon={pokemon} 
              openModal={openModal} 
              typeColors={typeColors}
              isFavorite={isFavorite(pokemon.id)}
              toggleFavorite={toggleFavorite}
            />
          ))
        }
      

      </ul>
      </div>
      <PokemonModal pokemon={selected} closeModal={closeModal} typeColors={typeColors} />
      
      {/* Toast Notification for Saved Preferences */}
      {showToast && (
        <div 
          className="fixed bottom-4 right-4 bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50"
          role="status"
          aria-live="polite"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <footer role="contentinfo" className="mt-auto">
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Pokédex Swift. Built with ❤️ for Pokémon.
          </p>
        </div>
      </footer>
    </section>
  );
}
