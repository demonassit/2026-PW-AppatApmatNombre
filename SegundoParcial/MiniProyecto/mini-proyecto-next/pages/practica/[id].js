import { useRouter } from 'next/router';

export default function Practica() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <main>
      <h1>Ruta dinámica de práctica</h1>
      <p>El parámetro capturado por Next.js es: {id}</p>
    </main>
  );
}
