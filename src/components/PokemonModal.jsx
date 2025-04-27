// src/components/PokemonModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
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

  // Modal JSX
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 landscape:items-start landscape:overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Header */}
        <div className={clsx(headerBg, 'sticky top-0 z-10 p-6 flex items-center justify-center')}>
          <button
            onClick={() => closeModal(plink)}
            className="absolute top-3 right-3 text-white hover:text-gray-200"
            aria-label="Close"
          >
            <AiOutlineClose size={24} />
          </button>
          <img
            src={logoimg}
            alt="Close"
            className="absolute top-3 left-3 h-8 w-8 cursor-pointer transform transition hover:scale-105"
            onClick={() => closeModal(ballclose)}
          />
          <h2 className="text-2xl font-bold capitalize text-white">
            {pokemon.name}{' '}
            <span className="text-sm opacity-75">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
          </h2>
        </div>

        {/* Body */}
        <div className="bg-white p-6 grid grid-cols-1 gap-6">
          {/* Artwork & cry */}
          <div className="flex justify-center">
            <img
              src={imgUrl}
              alt={pokemon.name}
              className="cursor-pointer transform transition hover:scale-105"
              style={{ imageRendering: 'pixelated', maxHeight: '200px', width: 'auto' }}
              onClick={playCry}
            />
          </div>

          {/* Types */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {pokemon.types.map(t => (
              <span
                key={t.type.name}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs capitalize text-white',
                  typeColors[t.type.name]
                )}
              >
                {t.type.name}
              </span>
            ))}
          </div>

          {/* Shiny toggle */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setShiny(prev => !prev)}
              className="px-4 py-1 bg-gray-200 rounded-full text-sm"
            >
              {shiny ? 'Show Normal' : 'Show Shiny'}
            </button>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold mb-2">About</h3>
            <p className="text-sm text-gray-700">{aboutText}</p>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold">Height</h3>
              <p className="mt-1 text-sm">{pokemon.height / 10} m</p>
            </div>
            <div>
              <h3 className="font-bold">Weight</h3>
              <p className="mt-1 text-sm">{pokemon.weight / 10} Kg</p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="font-bold mb-2">Stats</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {pokemon.stats.map(st => (
                <li key={st.stat.name} className="capitalize">
                  <span className="font-semibold">{st.stat.name}</span>: {st.base_stat}
                </li>
              ))}
            </ul>
          </div>

          {/* Moves */}
          <div>
            <h3 className="font-bold mb-2">Moves</h3>
            <ul className="grid grid-cols-2 gap-1 text-sm h-40 overflow-y-auto">
              {pokemon.moves.slice(0, 12).map(m => (
                <li key={m.move.name} className="capitalize">
                  {m.move.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
