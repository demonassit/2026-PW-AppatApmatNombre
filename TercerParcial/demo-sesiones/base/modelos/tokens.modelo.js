function crearModeloTokens(pool){
    //la función para revocar un token
    async function revocar(jti, usuario, exp) {
        await pool.query(
            'INSERT INTO tokens_revocados(jti, usuario, expira) VALUES (?, ?, FROM_UNIXTIME(?))', [jti, usuario, exp]
        );
    }

    //vamos a consultar los tokens revocados
    async function estaRevocado(jti) {
        const [filas] = await pool.query('SELECT 1 FROM tokens_revocados WHERE jti = ?', [String(jti || '')]);
        return filas.length > 0;
    }

    // necesitamos consultar el estado del diagnostico de los tokens
    async function listar() {
        const [filas] = await pool.query(
            'SELECT jti, usuario, expira, revocado_en FROM tokens_revocados ORDER BY revocado_en DESC, jti'
        );
        return filas;
        
    }

    return {revocar, estaRevocado, listar};
}

module.exports = {crearModeloTokens}