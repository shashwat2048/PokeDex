import clsx from "clsx";
import { useRef, useState, useEffect, memo } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import logoimg from "../assets/pokeball.png";
import ballopen from "../assets/show.mp3";
import plink from "../assets/plink.mp3";
import openball from '../assets/openball.png';

function PokemonCard({pokemon, openModal, typeColors, isFavorite, toggleFavorite}) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
  const audioRef = useRef(null);

  // ✅ FIX: Initialize audio only once and cleanup on unmount
  useEffect(() => {
    audioRef.current = new Audio(cryUrl);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [cryUrl]);

  const playCry = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.5; 
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  const pokemonImg = (pokemon) => {
    const dream = pokemon.sprites.other?.dream_world?.front_default;
    if (dream) return dream;

    const official = pokemon.sprites.other?.['official-artwork']?.front_default;
    if (official) return official;

    return pokemon.sprites.front_default || openball;
  };
  let bgColor = typeColors[pokemon.types[0].type.name] || '#E0E0E0';

  // 3D Tilt effect handlers - more prominent
  const handleImageMouseMove = (e) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // More prominent tilt - reduced divisor from 10 to 6
    const rotateX = (y - centerY) / 6;
    const rotateY = (centerX - x) / 6;
    
    setTilt({ rotateX, rotateY });
  };

  const handleImageMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

    return (
      <li 
        className={clsx(bgColor, "rounded-br-lg rounded-tl-lg flex flex-col overflow-hidden")}
        role="listitem"
      >
      <article
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-br-full shadow-lg p-4 transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
      )}
      aria-label={`${pokemon.name}, number ${pokemon.id}, ${pokemon.types.map(t => t.type.name).join(' and ')} type Pokémon`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-gray-900 dark:text-white" aria-label={`Pokémon number ${pokemon.id}`}>
            #{String(pokemon.id).padStart(3, '0')}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(pokemon.id, e);
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1 hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            aria-label={isFavorite ? `Remove ${pokemon.name} from favorites` : `Add ${pokemon.name} to favorites`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            type="button"
          >
            {isFavorite ? (
              <MdFavorite className="text-red-500 text-lg" aria-hidden="true" />
            ) : (
              <MdFavoriteBorder className="text-gray-400 dark:text-gray-500 text-lg hover:text-red-400" aria-hidden="true" />
            )}
          </button>
        </div>
        <button 
          className="capitalize text-sm font-semibold flex flex-row gap-2 cursor-pointer text-gray-900 dark:text-white hover:opacity-80 transition-opacity" 
          onClick={()=>openModal(pokemon, ballopen)}
          aria-label={`Quick view ${pokemon.species.name}`}
          tabIndex={0}
        >
          <img src={logoimg} alt="" className="h-[20px] w-[20px] transform transition duration-300 hover:scale-105" aria-hidden="true"/>
          {pokemon.species.name}
        </button>
      </div>
      <h2 className="text-xl font-bold capitalize h-10 text-gray-900 dark:text-white">{pokemon.name}</h2>
      <div className="flex justify-center my-2" style={{ perspective: '800px' }}>
        <button
          onClick={playCry}
          onMouseMove={handleImageMouseMove}
          onMouseLeave={handleImageMouseLeave}
          className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          aria-label={`Play ${pokemon.name}'s cry sound`}
          title={`Click to hear ${pokemon.name}'s cry`}
          style={{
            transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.rotateX || tilt.rotateY ? 1.15 : 1})`,
            transition: 'transform 0.1s ease-out',
            filter: tilt.rotateX || tilt.rotateY ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' : 'none'
          }}
        >
          <img
            src={ pokemonImg(pokemon)}
            alt={`${pokemon.name} official artwork`}
            className="w-24 h-24 cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
          />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Pokémon types">
        {pokemon.types.map((t) => {
          const name = t.type.name;
          const badgeClass = typeColors[name] || 'bg-[#E0E0E0]';
          return (
            <span
              key={name}
              className={clsx(
                "px-2 py-1 rounded-full text-xs capitalize",
                badgeClass,
                "text-white font-medium"
              )}
              role="listitem"
              aria-label={`Type: ${name}`}
            >
              {name}
            </span>
          );
        })}
      </div>
      
    </article>
    <button 
      onClick={() => openModal(pokemon, plink)} 
      className="px-2 py-1 rounded-br-lg rounded-tl-lg text-xs capitalize font-semibold bg-[#ffffff8d] m-3 transform transition duration-300 hover:bg-[#ffffffcd] focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
      aria-label={`View detailed information about ${pokemon.name}`}
    >
      View details
    </button>
    </li>
    )
}

// ✅ FIX: Memoize component to prevent unnecessary re-renders
export default memo(PokemonCard, (prevProps, nextProps) => {
  return (
    prevProps.pokemon.id === nextProps.pokemon.id &&
    prevProps.isFavorite === nextProps.isFavorite
  );
});