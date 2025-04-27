import { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard";
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { FcSearch } from "react-icons/fc";
import PokemonModal from "./PokemonModal";
import logoimg from "../assets/pokeball.png";
import { MdMusicNote, MdMusicOff} from "react-icons/md";
import bgMusic from "../assets/bgMusic.mp3";
import LoaderCard from "./LoaderCard";
import { data } from "autoprefixer";


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
  const [isBgPlaying, setIsBgPlaying] = useState(false);

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
      if (search) {
        pokemonsTofetch = allPokemonData.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      } else {
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
  }, [allPokemonData, currPage, search]);

  const totalpokeCard = search
    ? allPokemonData.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ).length
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
}

  return (
    <section className="container mx-auto px-2 sm:px-4 py-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0 sticky top-0 p-2 z-20 bg-[#d4eeff]">
        <div onClick={goHome} className="flex flex-row gap-3 justify-center items-center cursor-pointer">
        <img src={logoimg} alt="" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center sm:text-left">
        Pokédex Swift
        </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:space-x-4 w-full sm:w-auto gap-2">
            <button onClick={handleBgMusic}>
                {isBgPlaying ? <MdMusicNote /> : <MdMusicOff />}
            </button>
          <div className="relative text-gray-400 focus-within:text-gray-600 flex-1 sm:flex-none">
            <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg" />
            <input
              type="text"
              placeholder="Search Pokémon..."
              onClick={e => e.target.placeholder = "Gotta Catch 'em All!"}
              value={search}
              onChange={e => {
                e.target.placeholder = "Search Pokémon...";
                setSearch(e.target.value);
                setCurrPage(1);
              }}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm rounded-tl-lg rounded-br-lg"
            />
          </div>
          {!search && (
            <div className="flex justify-center sm:justify-start items-center space-x-2 mt-2 sm:mt-0">
              <button
                onClick={handlePrev}
                disabled={currPage === 1}
                className="flex items-center justify-center px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm rounded-tl-lg rounded-br-lg"
              >
                <AiOutlineLeft />
              </button>
              <span className="text-sm">
                Page {currPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currPage === totalPages}
                className="flex items-center justify-center px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm rounded-bl-lg rounded-tr-lg"
              >
                <AiOutlineRight />
              </button>
            </div>
          )}
        </div>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {
          loading 
          && 
          Array(pageSize).fill(0).map((idx)=>{
          return(
          <LoaderCard key={idx}/>
          )
          })
        }

        {
          pokeData.map(pokemon => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} openModal={openModal} typeColors={typeColors}/>
          ))
        }
      

      </ul>
      <PokemonModal pokemon={selected} closeModal={closeModal} typeColors={typeColors} />
      <footer>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Pokédex Swift. All rights reserved.
          </p>
        </div>
      </footer>
    </section>
  );
}
