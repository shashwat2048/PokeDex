import clsx from "clsx";
import { useRef } from "react";
import logoimg from "../assets/pokeball.png";
export default function PokemonCard({pokemon, setSelected, typeColors}) {
  const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
  const audioRef = useRef(new Audio(cryUrl));

  const playCry = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };


      let bgColor = typeColors[pokemon.types[0].type.name] || '#E0E0E0';
    return (
      <div className={clsx(bgColor, "rounded-br-lg flex flex-col")}>
      <div
      onClick={playCry}
      onDoubleClick={() => setSelected(pokemon)}
      className={clsx(
        "cursor-pointer bg-white rounded-br-full rounded-tl-lg shadow-lg p-4 transform transition duration-300 hover:scale-105 hover:shadow-2xl"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono font-bold text-sm">
          #{String(pokemon.id).padStart(3, '0')}
        </span>
        <span className="capitalize text-sm font-semibold flex flex-row gap-2">
          <img src={logoimg} alt="" className="h-[20px] w-[20px]"/>
          {pokemon.species.name}
        </span>
      </div>
      <h2 className="text-xl font-bold capitalize">{pokemon.name}</h2>
      <div className="flex justify-center my-2">
        <img
          src={pokemon.sprites.other.dream_world.front_default === null ? pokemon.sprites.front_default : pokemon.sprites.other.dream_world.front_default}
          alt={pokemon.name}
          className="w-24 h-24"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
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
            >
              {name}
            </span>
          );
        })}
      </div>
      
    </div>
    <button onClick={() => {setSelected(pokemon); playCry();}} className="px-2 py-1 rounded-br-lg rounded-tl-lg text-xs capitalize font-semibold bg-[#ffffff8d] m-3">View details</button>
    </div>
    )
}