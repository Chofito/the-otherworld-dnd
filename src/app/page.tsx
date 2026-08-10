export default function HomePage() {
  return (
    <main className="home">
      <header className="home__hero">
        <p className="home__eyebrow">Placeholder · marca</p>
        <h1 className="home__brand">The Otherworld</h1>
        <p className="home__lede">
          Placeholder · frase corta que presenta el mundo / la aventura.
        </p>
      </header>

      <section className="home__section" aria-labelledby="home-about">
        <h2 id="home-about">Sobre la mesa</h2>
        <p>
          Placeholder · párrafo corto: qué es esta partida, tono, para quién.
        </p>
      </section>

      <section className="home__section" aria-labelledby="home-how">
        <h2 id="home-how">Cómo entras</h2>
        <ol className="home__steps">
          <li>Placeholder · recibes un enlace de invitación del DM</li>
          <li>Placeholder · conoces la campaña y creas tu personaje</li>
          <li>Placeholder · el mismo link queda como tu ficha</li>
        </ol>
        <p className="muted">
          Los jugadores no se registran aquí: llegan por su link{' '}
          <code>/i/…</code>.
        </p>
      </section>

      <section className="home__section" aria-labelledby="home-party">
        <h2 id="home-party">La compañía</h2>
        <p className="muted">
          Placeholder · lista o teaser de jugadores/personajes (cuando quieras
          mostrarla en público).
        </p>
        <div className="home__grid" aria-hidden="true">
          <div className="home__slot">Slot personaje 1</div>
          <div className="home__slot">Slot personaje 2</div>
          <div className="home__slot">Slot personaje 3</div>
          <div className="home__slot">Slot personaje 4</div>
        </div>
      </section>

      <section className="home__section" aria-labelledby="home-session">
        <h2 id="home-session">Próxima sesión</h2>
        <dl className="home__facts">
          <div>
            <dt>Cuándo</dt>
            <dd>Placeholder · fecha / hora</dd>
          </div>
          <div>
            <dt>Dónde</dt>
            <dd>Placeholder · lugar / online</dd>
          </div>
          <div>
            <dt>Notas</dt>
            <dd>Placeholder · qué traer / nivel / etc.</dd>
          </div>
        </dl>
      </section>

      <footer className="home__footer muted">
        <p>The Otherworld · acceso jugadores por invitación</p>
      </footer>
    </main>
  );
}
