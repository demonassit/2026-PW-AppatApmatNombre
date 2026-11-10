import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Mini-proyecto Next.js — Semana 9</h1>
      <p>
        <Link href="/practica/1">Ir a /practica/1 (ruta dinámica)</Link>
      </p>
      <h2>Lo nuevo esta semana</h2>
      <ul>
        <li>/admin/usuarios completa el CRUD (editar y eliminar); el backend elige MySQL o Supabase con DB_MOTOR.</li>
      </ul>
    </main>
  );
}
