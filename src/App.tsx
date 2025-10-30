import './App.css'
import Pages from "@/pages/index.tsx"
import { Toaster } from "@/components/ui/toaster"
import { ConfirmationModalProvider } from "@/contexts/ConfirmationModalContext"

function App() {
  return (
    <ConfirmationModalProvider>
      <Pages />
      <Toaster />
    </ConfirmationModalProvider>
  )
}

export default App 