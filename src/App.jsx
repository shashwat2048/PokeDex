import './App.css'
import PokemonData from './components/PokemonData'
import ErrorBoundary from './components/ErrorBoundary'
import ClickSpark from './components/ClickSpark'

function App() {

  return (
    <ErrorBoundary>
      <ClickSpark
        sparkColor='#FFD700'
        sparkSize={12}
        sparkRadius={20}
        sparkCount={12}
        duration={500}
      >
        <div className="min-h-screen w-full bg-[#d4eeff] dark:bg-[#1e293b] transition-colors duration-300">
          <PokemonData />
        </div>
      </ClickSpark>
    </ErrorBoundary>
  )
}
export default App
