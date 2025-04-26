export default function PokemonCard({pokemon}){
    return (
        <div className="border-2 border-black">
            <h2>{pokemon.name}</h2>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
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