import clsx from "clsx";
import { useRef } from "react";
import logoimg from "../assets/pokeball.png";
import ballopen from "../assets/show.mp3";
import plink from "../assets/plink.mp3";
export default function PokemonCard({pokemon, openModal, typeColors}) {

  const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
  const audioRef = useRef(new Audio(cryUrl));

  const playCry = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  const pokemonImg = (pokemon) => {
    const dream = pokemon.sprites.other?.dream_world?.front_default;
    if (dream) return dream;

    const official = pokemon.sprites.other?.['official-artwork']?.front_default;
    if (official) return official;

    return pokemon.sprites.front_default;
  };
  


      let bgColor = typeColors[pokemon.types[0].type.name] || '#E0E0E0';
    return (
      <div className={clsx(bgColor, "rounded-br-lg flex flex-col overflow-hidden")}>
      <div
      className={clsx(
        "bg-white rounded-br-full rounded-tl-lg shadow-lg p-4 transform transition duration-300 hover:scale-105 hover:shadow-2xl"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono font-bold text-sm">
          #{String(pokemon.id).padStart(3, '0')}
        </span>
        <span className="capitalize text-sm font-semibold flex flex-row gap-2 cursor-pointer" onClick={()=>openModal(pokemon, ballopen)}>
          <img src={logoimg} alt="" className="h-[20px] w-[20px]"/>
          {pokemon.species.name}
        </span>
      </div>
      <h2 className="text-xl font-bold capitalize">{pokemon.name}</h2>
      <div className="flex justify-center my-2">
        <img
          src={ pokemonImg(pokemon)}
          alt={pokemon.name}
          className="w-24 h-24 cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
          onClick={playCry}
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
    <button onClick={() => openModal(pokemon, plink)} className="px-2 py-1 rounded-br-lg rounded-tl-lg text-xs capitalize font-semibold bg-[#ffffff8d] m-3">View details</button>
    </div>
    )
}