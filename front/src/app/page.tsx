import Tabs from '../components/Tabs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">ONG Trazabilidad de Donaciones</h1>
          <p className="mt-2 text-lg">Gestiona y sigue el recorrido de tus donaciones de manera eficiente y transparente.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <img
                src="https://via.placeholder.com/600x400?text=Trazabilidad+de+Donaciones"
                alt="Trazabilidad de Donaciones"
                className="rounded-lg shadow-lg"
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

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 ONG Trazabilidad de Donaciones. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
