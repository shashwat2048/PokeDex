export default function PokemonCard({pokemon}){
    const cryUrl = pokemon.cries.latest;
    const audio = new Audio(cryUrl);
    const playCry = () =>{
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0; 
        }
        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
        });
    }
    return (
        <div onClick={playCry} className="border-2 border-black">
            <h2>{pokemon.name}</h2>
            <img src={pokemon.sprites.other.showdown.front_default} alt={pokemon.name} />
            <p>Height: {pokemon.height}</p>
            <p>Weight: {pokemon.weight}</p>
            <p>Base Experience: {pokemon.base_experience}</p>
            <ul>
                {pokemon.types.map((type) => {
                    return (
                        <li key={type.type.name}>{type.type.name}</li>
                    )
                })}
            </ul>
        </div>
    )
}