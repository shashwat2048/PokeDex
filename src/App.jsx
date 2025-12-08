import './App.css'
import PokemonData from './components/PokemonData'
import ErrorBoundary from './components/ErrorBoundary'

function App() {

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-[#d4eeff] dark:bg-[#1e293b] transition-colors duration-300">
        <PokemonData />
      </div>
    </ErrorBoundary>
  )
}
export default App
