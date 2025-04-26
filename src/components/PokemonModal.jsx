import { AiOutlineClose } from 'react-icons/ai';

export default function PokemonModal({ pokemon, onClose }) {
  if (!pokemon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          <AiOutlineClose size={24} />
        </button>
        <div className="flex flex-col items-center">
          <img
            src={pokemon.sprites.other.showdown.front_default}
            alt={pokemon.name}
            className="w-auto h-auto mb-4"
            style={{ imageRendering: 'pixelated' }}
          />
          <h2 className="text-2xl font-bold capitalize mb-2">{pokemon.name}</h2>
          <p className="text-sm text-gray-600 mb-4">#{String(pokemon.id).padStart(3, '0')}</p>
          <div className="w-full mb-4">
            <h3 className="font-semibold">Height & Weight</h3>
            <p className="text-sm">Height: {pokemon.height}</p>
            <p className="text-sm">Weight: {pokemon.weight}</p>
          </div>
          <div className="w-full mb-4">
            <h3 className="font-semibold">Abilities</h3>
            <ul className="list-disc list-inside text-sm">
              {pokemon.abilities.map(ab => (
                <li key={ab.ability.name}>{ab.ability.name}</li>
              ))}
            </ul>
          </div>
          <div className="w-full mb-4">
            <h3 className="font-semibold">Stats</h3>
            <ul className="text-sm">
              {pokemon.stats.map(st => (
                <li key={st.stat.name} className="capitalize">
                  {st.stat.name}: {st.base_stat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}