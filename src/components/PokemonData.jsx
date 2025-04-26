import { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard";
import { FcSearch } from "react-icons/fc";

export default function PokemonData(){
    const [pokeData, setPokeData] = useState([]);
    const API = "https://pokeapi.co/api/v2/pokemon?limit=500";
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const fetchPokemons = async () => {
        try{
            const resp = await fetch(API);
            const data = await resp.json();
            console.log(data);
            const detailedPokeData = data.results.map(async(pokemon) => {
                const resp = await fetch(pokemon.url);
                const data = await resp.json();
                console.log(data);
                return data;
            });
            const resolvedPokeData = await Promise.all(detailedPokeData);
            console.log(resolvedPokeData);
            setPokeData(resolvedPokeData);
        }
        catch(err){
            console.error(err);
            setError(err);
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchPokemons();
    },[])

    const searchPokemon = pokeData.filter((pokemon) => {
        return pokemon.name.toLowerCase().includes(search.toLowerCase());
    })

    if(loading){
        return(
            <h1 className="text-2xl font-bold text-center mt-10">Loading...</h1>
        )
    }
    if(error){
        return(
            <h1 className="text-2xl font-bold text-center mt-10 text-red-500">Error: Sorry some unexpected error occured!</h1>
        )
    }

    return(
        <section className="container mx-auto px-4 py-8">
            <header>
                <h1 className="text-4xl font-extrabold text-center mb-8">Gotta Catch 'em All!</h1>
            </header>
            <div className="mb-8 flex flex-row justify-center items-center gap-1">
                <input type="text" placeholder="Search for a Pokémon..." className="w-full p-2 border border-gray-300 rounded-lg"
                 value={search} onChange={(e) => setSearch(e.target.value)}
                />
                <FcSearch className="h-[32px] w-[32px]"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchPokemon.map((pokemon) => (
                    <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
            </div>
      </section>
    )

}

// https://pokeapi.co/api/v2/pokemon?limit=1000

