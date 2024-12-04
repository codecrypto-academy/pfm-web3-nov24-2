import Tabs from '../components/Tabs';
import WalletActions from '../components/WalletActions';
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#B3E5FC] text-gray-800 py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ONG Trazabilidad de Donaciones</h1>
            <p className="mt-2 text-lg">Gestiona y sigue el recorrido de tus donaciones de manera eficiente y transparente.</p>
          </div>
          <WalletActions />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 flex justify-start">
              <img
                src="/logo.jpeg"
                alt="Logo de ONG Trazabilidad de Donaciones"
                className="rounded-lg shadow-lg max-w-[350px] max-h-[350px] object-contain"
              />
            </div>
            <div className="md:w-1/2 md:pl-8 mt-6 md:mt-0">
              <h2 className="text-2xl font-bold text-gray-800">Bienvenido a nuestra plataforma</h2>
              <p className="mt-4 text-gray-700">
                Nuestra ONG se dedica a asegurar que cada donación llegue a su destino de manera segura y eficiente. 
                Utiliza nuestra plataforma para gestionar y seguir el recorrido de tus donaciones en tiempo real.
              </p>
            </div>
          </div>
        </section>

        <section>
          <Tabs />
        </section>
      </main>

      <footer className="bg-[#B3E5FC] text-gray-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 ONG Trazabilidad de Donaciones. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
