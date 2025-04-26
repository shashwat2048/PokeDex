import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import clsx from 'clsx';

export default function PokemonModal({ pokemon, onClose, typeColors }) {
  if (!pokemon) return null;

  const [shiny, setShiny] = useState(false);
  const imgUrl = shiny ? pokemon.sprites.other.showdown.front_shiny : pokemon.sprites.other.showdown.front_default;

  const headerBg = typeColors[pokemon.types[0].type.name] || 'bg-gray-300';
  console.log(pokemon);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={clsx(headerBg, 'h-24 flex items-center justify-center relative')}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-gray-200"
            aria-label="Close"
          >
            <AiOutlineClose size={24} />
          </button>
          <h2 className="text-2xl font-bold capitalize text-white">
            {pokemon.name}{' '}
            <span className="text-sm opacity-75">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
          </h2>
        </div>

        {/* Body */}
        <div className="bg-white p-6 grid grid-cols-1 gap-6">
          {/* Artwork & shiny toggle */}
          <div className="flex justify-center">
            <img
              src={imgUrl}
              alt={pokemon.name}
              className="w-auto h-auto"
              style={{ imageRendering: 'pixelated' }}
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
            <div className="flex items-center justify-center space-x-4">
            <span className="text-sm font-semibold">Change Form:</span>
            <button
              onClick={() => setShiny(prev => !prev)}
              className="px-4 py-1 bg-gray-200 rounded-full text-sm"
            >
              {shiny ? 'Normal' : 'Shiny'}
            </button>
          </div>
          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold">Height:</h3>
              <p className="mt-1 text-sm">{pokemon.height}</p>
            </div>
            <div>
              <h3 className="font-bold">Weight:</h3>
              <p className="mt-1 text-sm">{pokemon.weight}</p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="font-bold mb-2">Stats:</h3>
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
            <h3 className="font-bold mb-2">Moves:</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm h-40 overflow-y-auto">
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