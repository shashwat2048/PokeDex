import { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard";

export default function PokemonData(){
    const [pokeData, setPokeData] = useState([]);
    const API = "https://pokeapi.co/api/v2/pokemon?limit=25";

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
        }
    }
    useEffect(() => {
        fetchPokemons();
    },[])

    return(
        <section>
            <header>
                <h1>Gotta Catch 'em All!</h1>
            </header>
            <main>
                <ul>
                    {pokeData.map((pokemon) => {
                        return (
                            <li key={pokemon.id}>
                                <PokemonCard pokemon={pokemon}/>
                            </li>
                        )
                    })}
                </ul>
            </main>
        </section>
    )

}

// https://pokeapi.co/api/v2/pokemon?limit=1000