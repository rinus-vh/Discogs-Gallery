import { AppProvider, useAppContext } from './context/AppContext'

import { Home } from './pages/Home'
import { InputNewCollection } from './pages/InputNewCollection'
import { CollectionGallery } from './pages/CollectionGallery'
import { BreadcrumbMenu } from './features/BreadcrumbMenu'

import './cssGlobal/color.css'
import './cssGlobal/sizes.css'

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  )
}

function Main() {
  const { page } = useAppContext()

  return (
    <div className="min-h-screen bg-black text-white">
      <BreadcrumbMenu />

      {page === 'home' && <Home />}
      {page === 'input' && <InputNewCollection />}
      {page === 'edit' && <CollectionGallery />}
    </div>
  )
}
