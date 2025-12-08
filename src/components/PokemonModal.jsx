// src/components/PokemonModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { MdShare, MdContentCopy } from 'react-icons/md';
import clsx from 'clsx';
import logoimg from '../assets/pokeball.png';
import ballclose from '../assets/pokeclose.mp3';
import plink from '../assets/plink.mp3';
import openball from '../assets/openball.png';

export default function PokemonModal({ pokemon, closeModal, typeColors }) {
  if (!pokemon) return null;

  // Audio for cry
  const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
  const audioRef = useRef(new Audio(cryUrl));
  const playCry = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  // Shiny toggle
  const [shiny, setShiny] = useState(false);
  
  // Share notification
  const [showShareToast, setShowShareToast] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('about');

  // 3D Tilt effect for image
  const [imageTilt, setImageTilt] = useState({ rotateX: 0, rotateY: 0 });

 
  const getSprite = (source) => {
    if (!source) return null;
    return source[`front_${shiny ? 'shiny' : 'default'}`] || null;
  };

  const showdownUrl = getSprite(pokemon.sprites.other?.showdown);
  const officialUrl = getSprite(pokemon.sprites.other?.['official-artwork']);
  const defaultUrl = pokemon.sprites.front_default;
  const imgUrl = showdownUrl || officialUrl || defaultUrl || openball;


  const headerBg = typeColors[pokemon.types[0].type.name] || 'bg-gray-300';


  const [aboutText, setAboutText] = useState('Loading...');
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${pokemon.species.url}`);
        const data = await res.json();
        const entry = data.flavor_text_entries.find(e => e.language.name === 'en');
        const about = entry
          ? entry.flavor_text.replace(/[\n\r\f]/g, ' ')
          : 'No description available.';
        setAboutText(about);
      } catch {
        setAboutText('No description available.');
      }
    })();
  }, [pokemon.id]);

  // Keyboard support for closing modal with ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal(plink);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeModal]);

  // Focus management - focus first interactive element when modal opens
  useEffect(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [pokemon.id]);

  // Share Pokemon
  const handleShare = async () => {
    const pokemonImage = pokemon.sprites.other?.['official-artwork']?.front_default || 
                        pokemon.sprites.front_default;
    
    const shareText = `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (#${String(pokemon.id).padStart(3, '0')})\n` +
                     `Type: ${pokemon.types.map(t => t.type.name).join('/')}\n` +
                     `Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg\n` +
                     `\nView in Pokédex Swift: ${window.location.href}\n` +
                     `Image: ${pokemonImage}`;

    const shareData = {
      title: `${pokemon.name} - Pokédex Swift`,
      text: shareText,
      url: window.location.href
    };

    try {
      // Try Web Share API (works on mobile, can share with image)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast('Shared successfully!');
      } else if (navigator.share) {
        // Share without checking canShare (older browsers)
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url
        });
        showToast('Shared successfully!');
      } else {
        // Fallback: Copy rich text to clipboard
        await navigator.clipboard.writeText(shareText);
        showToast('Details copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        showToast('Failed to share');
      }
    }
  };

  const showToast = (message) => {
    setShowShareToast(message);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  // 3D Tilt handlers for image
  const handleImageMouseMove = (e) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setImageTilt({ rotateX, rotateY });
  };

  const handleImageMouseLeave = () => {
    setImageTilt({ rotateX: 0, rotateY: 0 });
  };

  // Modal JSX
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center p-4 z-50 landscape:items-start landscape:overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(plink); }}
    >
      <div 
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-800"
        role="document"
      >
        {/* Header */}
        <div className={clsx(headerBg, 'sticky top-0 z-10 p-6 flex items-center justify-center')}>
          <button
            onClick={() => closeModal(plink)}
            className="absolute top-3 right-3 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label={`Close ${pokemon.name} details modal`}
            title="Close modal (Esc)"
          >
            <AiOutlineClose size={24} aria-hidden="true" />
          </button>
          <button
            className="absolute top-3 left-3 h-8 w-8 cursor-pointer transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={() => closeModal(ballclose)}
            aria-label={`Close ${pokemon.name} details with Pokéball sound`}
            title="Close with sound effect"
          >
            <img
              src={logoimg}
              alt=""
              aria-hidden="true"
            />
          </button>
          <h2 
            id="modal-title"
            className="text-2xl font-bold capitalize text-white"
          >
            {pokemon.name}{' '}
            <span className="text-sm opacity-75">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
          </h2>
          <button
            onClick={handleShare}
            className="absolute top-3 right-12 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded p-0.5"
            aria-label={`Share ${pokemon.name}`}
            title="Share this Pokémon"
          >
            <MdShare size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-gray-800 p-6 grid grid-cols-1 gap-6">
          {/* Artwork & cry */}
          <div className="flex justify-center" style={{ perspective: '1000px' }}>
            <button
              onClick={playCry}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
              className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              aria-label={`Play ${pokemon.name}'s cry sound`}
              title={`Click to hear ${pokemon.name}'s cry`}
              style={{
                transform: `perspective(1000px) rotateX(${imageTilt.rotateX}deg) rotateY(${imageTilt.rotateY}deg) scale(${imageTilt.rotateX || imageTilt.rotateY ? 1.1 : 1})`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              <img
                src={imgUrl}
                alt={`${pokemon.name} ${shiny ? 'shiny' : 'normal'} sprite`}
                className="cursor-pointer"
                style={{ imageRendering: 'pixelated', maxHeight: '200px', width: 'auto' }}
              />
            </button>
          </div>

          {/* Types */}
          <div className="flex flex-wrap gap-2 items-center justify-center" role="list" aria-label="Pokémon types">
            {pokemon.types.map(t => (
              <span
                key={t.type.name}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs capitalize text-white',
                  typeColors[t.type.name]
                )}
                role="listitem"
                aria-label={`Type: ${t.type.name}`}
              >
                {t.type.name}
              </span>
            ))}
          </div>

          {/* Shiny toggle */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setShiny(prev => !prev)}
              className="px-4 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={shiny ? `Show normal ${pokemon.name} sprite` : `Show shiny ${pokemon.name} sprite`}
              aria-pressed={shiny}
            >
              {shiny ? 'Show Normal' : 'Show Shiny'}
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px" role="tablist">
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-3 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 'about'}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-3 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 'stats'}
              >
                Stats
              </button>
              <button
                onClick={() => setActiveTab('moves')}
                className={`flex-1 py-3 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'moves'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 'moves'}
              >
                Moves
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-4">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div role="tabpanel" className="space-y-4 animate-fade-in">
                <section aria-labelledby="about-heading">
                  <h3 id="about-heading" className="font-bold mb-2 text-gray-900 dark:text-white">Description</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{aboutText}</p>
                </section>

                <section aria-labelledby="physical-heading">
                  <h3 id="physical-heading" className="font-bold mb-3 text-gray-900 dark:text-white">Physical Characteristics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Height</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pokemon.height / 10} m</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Weight</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pokemon.weight / 10} kg</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div role="tabpanel" className="animate-fade-in">
                <section aria-labelledby="stats-heading">
                  <h3 id="stats-heading" className="font-bold mb-4 text-gray-900 dark:text-white">Base Stats</h3>
                  <div className="space-y-3">
                    {pokemon.stats.map(st => {
                      const statName = st.stat.name.replace('-', ' ');
                      const statValue = st.base_stat;
                      const maxStat = 255;
                      const percentage = (statValue / maxStat) * 100;
                      
                      let barColor = 'bg-red-500';
                      if (statValue >= 100) barColor = 'bg-green-500';
                      else if (statValue >= 70) barColor = 'bg-yellow-500';
                      else if (statValue >= 50) barColor = 'bg-orange-500';

                      return (
                        <div key={st.stat.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold capitalize text-gray-700 dark:text-gray-300 w-32">
                              {statName}
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">
                              {statValue}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
                              style={{ width: `${percentage}%` }}
                              aria-label={`${statName}: ${statValue} out of ${maxStat}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {pokemon.stats.reduce((sum, st) => sum + st.base_stat, 0)}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Moves Tab */}
            {activeTab === 'moves' && (
              <div role="tabpanel" className="animate-fade-in">
                <section aria-labelledby="moves-heading">
                  <h3 id="moves-heading" className="font-bold mb-3 text-gray-900 dark:text-white">
                    Available Moves <span className="text-xs font-normal text-gray-500">({pokemon.moves.length} total)</span>
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <ul className="grid grid-cols-2 gap-2" role="list">
                      {pokemon.moves.slice(0, 20).map(m => (
                        <li 
                          key={m.move.name} 
                          className="capitalize text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                        >
                          {m.move.name.replace('-', ' ')}
                        </li>
                      ))}
                    </ul>
                    {pokemon.moves.length > 20 && (
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                        + {pokemon.moves.length - 20} more moves
                      </p>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Share Toast */}
        {showShareToast && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <MdContentCopy className="text-green-400" aria-hidden="true" />
            <span className="text-sm font-medium">{showShareToast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
